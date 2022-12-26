import { Context, Telegraf } from "telegraf";
import { Markup } from "telegraf";
import { retry } from "ts-retry-promise";
import fastq from "fastq";
import parallel from "run-parallel";
import { Translate } from "../../api/index.js";
import { DETECT_NAME_REGEXP } from "../../api/const/index.js";
import {
  DbStructure,
  TelegramTaskQueue,
  TgActionContext,
  TgTriggerContext,
} from "../../types/index.js";
import { Database } from "st.db";
import { ServicesApi } from "../../services/api/index.js";
import { sleep } from "../../api/utils/index.js";

export class TelegramBot {
  private bot: Telegraf;
  private servicesApi = new ServicesApi();
  private translate: Translate = new Translate();
  private queue = fastq.promise<any, TelegramTaskQueue, void>(this._queue, 3);
  private db = new Database("history.yaml");

  constructor(token: string) {
    this.servicesApi.connect().then(async () => {
      this.db.on("ready", () => console.log("Database Ready!"));

      this.bot = new Telegraf(token);
      this.bot.start(this.onConversationStart.bind(this));
      this.bot.hears([/ettie/gi, /етти/gi, /ети/gi], (ctx) =>
        this.onTriggered(ctx)
      );
      this.bot.on("message", (ctx: any) => this.onMessage(ctx));
      this.bot.action("goOn", async (ctx) => this.onGoOnClick(ctx));
      this.bot.launch();
    });
  }

  private _getHistoryKey(ctx: TgTriggerContext | TgActionContext) {
    const chatKey = ctx.chat.id;
    const historyKey = ctx.from.id;
    const dbHistoryKey = chatKey + "." + historyKey;
    return dbHistoryKey;
  }

  private async _queue({
    ctx,
    question,
    id: messageId,
    self,
  }: TelegramTaskQueue) {
    const dbHistoryKey = self._getHistoryKey(ctx);

    let history;
    try {
      history = self.db.get({ key: dbHistoryKey }) ?? [];
      if (history.length === 0) self.db.set({ key: dbHistoryKey, value: [] });
      console.log(history);
    } catch (e) {
      console.error(e);
      throw e;
    }

    if (history.length > 2) self.db.shift(dbHistoryKey);

    let replied = false;
    parallel(
      [
        async (cb) => {
          await retry(
            async () => {
              if (replied === false) {
                await ctx.sendChatAction("typing");
                await sleep(2000);
                throw new Error();
              } else {
                cb(null, true);
              }
            },
            { retries: 100 }
          );
        },
        async (cb) => {
          await retry(
            async () => {
              try {
                console.log("started");

                const { lang: questionLang } = await self.translate.detectLang(
                  question
                );
                const answer = await self.servicesApi.requestAnswer(
                  question,
                  history
                );
                const { lang: answerLang } = await self.translate.detectLang(
                  answer.text
                );

                if (answerLang !== questionLang) {
                  const res = await self.translate.translateLongText(
                    answer.text,
                    questionLang
                  );
                  answer.text = res.text[0];
                }

                replied = true;
                cb(null, answer);
              } catch (e) {
                console.error(e);
                replied = true;
                cb(e);
                throw e;
              }
            },
            { retries: 3 }
          ).catch((err) => {
            console.log(err);
            replied = true;
            cb(err);
          });
        },
      ],
      async (err, results) => {
        if (err) throw err;
        const answer: any = results[1];
        await ctx.reply(answer.text, {
          reply_to_message_id: messageId,
          ...Markup.inlineKeyboard([
            // Markup.button.callback(goOnBtnText, "goOn"),
          ]),
          //...Markup.removeKeyboard(),
        });
      }
    );
  }

  private async onTriggered(ctx: TgTriggerContext) {
    const match: string[] = Object.values(ctx.match);

    DETECT_NAME_REGEXP.map((re) => {
      match[2] = match[2].replace(re, "");
    });

    console.info("sent to queue");
    this.queue.push({
      ctx,
      question: match[2].replace(",", "").trim(),
      id: ctx.message.message_id,
      self: this,
    });
  }

  private async onMessage(ctx: TgTriggerContext) {
    const replyData = ctx.message.reply_to_message;
    if (
      !replyData ||
      replyData.from.username !== process.env.TELEGRAM_BOT_USERNAME ||
      !ctx.message.text
    )
      return;

    this.queue.push({
      ctx,
      question: ctx.message.text.trim(),
      id: ctx.message.message_id,
      self: this,
    });
  }

  private async onGoOnClick(ctx: any) {
    await ctx.answerCbQuery("OK");

    const history = this.db.get({ key: this._getHistoryKey(ctx) });
    if (!history) return;
    const lastHistoryItem = history[history.length - 1];
    console.log(history);

    const { lang } = await this.translate.detectLang(lastHistoryItem.question);

    const {
      text: [goOnBtnText],
    } = await this.translate.translate("Keep going", lang);

    this.queue.push({
      ctx,
      question: goOnBtnText,
      id: undefined,
      self: this,
    });
  }

  private onConversationStart(ctx: Context) {
    console.log(ctx);
  }
}
