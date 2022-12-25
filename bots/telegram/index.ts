import { Context, Telegraf } from "telegraf";
import { retry } from "ts-retry-promise";
import fastq from "fastq";
import * as API from "../../api";
import { Translate } from "../../api";
import { DETECT_NAME_REGEXP } from "../../api/const";
import { DbStructure, TelegramTaskQueue, TgTriggerContext } from "../../types";
import { Database } from "st.db";

export class TelegramBot {
  private bot: Telegraf;
  private mainAPI: API.Main = new API.Main();
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
    this.bot.launch();
  }

  private async _queue({
    ctx,
    question,
    id: messageId,
    self,
  }: TelegramTaskQueue) {
    const chatKey = ctx.message.chat.id;
    const historyKey = ctx.message.from.id;
    const dbHistoryKey = chatKey + "." + historyKey;
    console.log("retry", historyKey);

    let history;
    try {
      history = self.db.get({ key: dbHistoryKey }) ?? [];
      if (history.length === 0) self.db.set({ key: dbHistoryKey, value: [] });
      console.log(history);
    } catch (e) {
      console.error(e);
      throw e;
    }

    await retry(
      async () => {
        console.log("started");

        // await ctx.sendChatAction("typing");
        // const {
        //   sourceLang: questionLang,
        //   text: [questionEn],
        // } = await self.translate.translate(question, "en");

        await ctx.sendChatAction("typing");
        const answer = await self.mainAPI.askQuestion(question, history);

        // await ctx.sendChatAction("typing");
        // const {
        //   text: [answerInSrcLang],
        // } = await self.translate.translateLongText(answer.text, questionLang);

        await ctx.reply(answer.text, {
          reply_to_message_id: messageId,
        });

        self.db.push({
          key: dbHistoryKey,
          value: {
            question: question,
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
