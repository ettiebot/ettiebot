import { Context, Telegraf } from "telegraf";
import { Markup } from "telegraf";
import { retry } from "ts-retry-promise";
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

export class TelegramBot {
  private bot: Telegraf;
  private servicesApi = new ServicesApi();
  private translate: Translate = new Translate();
  private queue = fastq.promise<any, TelegramTaskQueue, void>(this._queue, 3);
  private db = new Database("history.yaml", {
    encryption: { password: process.env.HISTORY_ENC_PASSWORD ?? "ettie" },
  });

  constructor(token: string) {
    this.db.on("ready", () => console.log("Database Ready!"));

    this.bot = new Telegraf(token);
    this.bot.start(this.onConversationStart.bind(this));
    this.bot.hears([/ettie/gi, /етти/gi, /ети/gi], (ctx) =>
      this.onTriggered(ctx)
    );
    this.bot.on("message", (ctx: any) => this.onMessage(ctx));
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

    if (history.length > 2) self.db.shift(dbHistoryKey);

    await retry(
      async () => {
        console.log("started");

        await ctx.sendChatAction("typing");
        const {
          sourceLang: lang,
          text: [questionEn],
        } = await self.translate.translate(question, "en");
        await ctx.sendChatAction("typing");

        await ctx.sendChatAction("typing");
        const answer = await self.servicesApi.requestAnswer(
          questionEn,
          history
        );

        await ctx.sendChatAction("typing");
        const {
          text: [answerInSrcLang],
        } = await self.translate.translateLongText(answer.text, lang);

        await ctx.sendChatAction("typing");
        const {
          text: [goOnBtnText],
        } = await self.translate.translate("Keep going", lang);

        await ctx.reply(answerInSrcLang, {
          reply_to_message_id: messageId,
          ...Markup.keyboard([goOnBtnText]).resize(true).oneTime(true),
        });

        self.db.push({
          key: dbHistoryKey,
          value: {
            question: questionEn,
            answer: answer.text,
          },
        });
      },
      { retries: 3 }
    ).catch((err) => console.log(err));
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

  private onConversationStart(ctx: Context) {
    console.log(ctx);
  }
}
