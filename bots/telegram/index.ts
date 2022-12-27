import { Context, Telegraf } from "telegraf";
import { Markup } from "telegraf";
import { retry } from "ts-retry-promise";
import RunParallel from "run-parallel";
import fastq from "fastq";
import { Translate } from "../../api";
import { DETECT_NAME_REGEXP } from "../../api/const";
import {
  DbStructure,
  TelegramTaskQueue,
  TgActionContext,
  TgTriggerContext,
} from "../../types";
import { Database } from "st.db";
import { ServicesApi } from "../../services/api";
import { sleep } from "../../api/utils";

export class TelegramBot {
  private bot: Telegraf;
  private servicesApi = new ServicesApi();
  private translate: Translate = new Translate();
  private queue = fastq.promise<any, TelegramTaskQueue, void>(this._queue, 3);
  private db = new Database("history.yaml");

  constructor(token: string) {
    this.db.on("ready", () => console.log("Database Ready!"));

    this.bot = new Telegraf(token);
    this.bot.start(this.onConversationStart.bind(this));
    this.bot.hears([/ettie/gi, /етти/gi, /ети/gi], (ctx) =>
      this.onTriggered(ctx)
    );
    this.bot.on("message", (ctx: any) => this.onMessage(ctx));
    this.bot.action("goOn", async (ctx) => this.onGoOnClick(ctx));
    this.bot.launch();
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

    if (JSON.stringify(history).length > 200) {
      self.db.set(dbHistoryKey, []);
      history = [];
    }

    const btns = (answerInSrcLang: string, goOnBtnText: string) => {
      if (answerInSrcLang.length < 100) return [];
      else return [Markup.button.callback(goOnBtnText, "goOn")];
    };

    let done = false;

    RunParallel([
      async () => {
        await retry(
          async () => {
            if (!done) {
              await ctx.sendChatAction("typing");
              await sleep(2000);
              throw new Error();
            } else return true;
          },
          { retries: 100 }
        );
      },
      async (cb) => {
        await retry(
          async () => {
            try {
              console.log("started");

              const {
                sourceLang: lang,
                text: [questionEn],
              } = await self.translate.translate(question, "en");

              const answer = await self.servicesApi.requestAnswer(
                questionEn,
                history
              );

              const {
                text: [answerInSrcLang],
              } = await self.translate.translateLongText(answer.text, lang);

              const {
                text: [goOnBtnText],
              } = await self.translate.translate("Keep going", lang);

              const btns = () => {
                if (history.length === 0 || answerInSrcLang.length < 100)
                  return [];
                else return [Markup.button.callback(goOnBtnText, "goOn")];
              };

              await ctx.reply(answerInSrcLang, {
                reply_to_message_id: messageId,
                ...Markup.inlineKeyboard(btns()),
                //...Markup.removeKeyboard(),
              });

              self.db.push({
                key: dbHistoryKey,
                value: {
                  question: questionEn,
                  answer: answer.text,
                  lang,
                },
              });

              done = true;

              cb(null, true);
            } catch (e) {
              console.error(e);
              throw e;
            }
          },
          { retries: 3 }
        ).catch((e) => {
          done = true;
          cb(e);
          console.error(e);
        });
      },
    ]);
  }

  private async onTriggered(ctx: TgTriggerContext) {
    const match = Object.values(ctx.match);

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

  private async onGoOnClick(ctx: TgActionContext) {
    await ctx.answerCbQuery("OK");

    const history = this.db.get({ key: this._getHistoryKey(ctx) });
    if (!history) return;
    const lastHistoryItem = history[history.length - 1];
    if (!lastHistoryItem || !lastHistoryItem.lang) return;
    console.log(history);

    const {
      text: [goOnBtnText],
    } = await this.translate.translate("Keep going", lastHistoryItem.lang);

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
