import { Context, Markup, NarrowedContext, Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { Update, Message } from "typegram";
import * as API from "../../api";
import { Translate } from "../../api";
import { DETECT_NAME_REGEXP } from "../../api/const";

export class TelegramBot {
  private bot: Telegraf;
  private mainAPI: API.Main = new API.Main();
  private translate: Translate = new Translate();

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.bot.start(this.onConversationStart.bind(this));
    this.bot.hears([/ettie/gi, /етти/gi, /ети/gi], (ctx) =>
      this.onTriggered(ctx)
    );
    this.bot.on("message", (ctx) => this.onMessage(ctx));
    //this.bot.context.on("ettiebot", (ctx) => this.onInlineQuery(ctx));
    this.bot.launch();
  }

  private onConversationStart(ctx: Context) {
    console.log(ctx);
  }

  private async onTriggered(
    ctx: NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >
  ) {
    const match = Object.values(ctx.match);

    DETECT_NAME_REGEXP.map((re) => {
      match[2] = match[2].replace(re, "");
    });

    const question = match[2].replace(",", "").trim();

    await this.getAnswer(ctx, question, ctx.message.message_id);
  }

  private async onMessage(ctx: any) {
    const replyData = ctx.message.reply_to_message;
    if (!replyData || replyData.from.username !== "ettiebot") return;

    await this.getAnswer(
      ctx,
      ctx.message.text,
      ctx.message.message_id,
      replyData.text
    );
  }

  private async getAnswer(
    ctx:
      | NarrowedContext<
          Context<Update> & {
            match: RegExpExecArray;
          },
          {
            message: Update.New & Update.NonChannel & Message.TextMessage;
            update_id: number;
          }
        >
      | NarrowedContext<
          Context<Update>,
          Update.MessageUpdate<Message> & { message: { reply_to_message: any } }
        >,
    question: string,
    messageId: number,
    pastAnswer?: string
  ) {
    let attempts = 0;
    while (attempts < 5) {
      try {
        const {
          sourceLang: questionLang,
          text: [questionEn],
        } = await this.translate.translate(question, "en");

        const {
          text: [isTypingText],
        } = await this.translate.translate("Ettie is typing...", questionLang);
        const replyMessage = await ctx.reply(isTypingText, {
          reply_to_message_id: messageId,
        });

        const answer = await this.mainAPI.askQuestion(questionEn, pastAnswer);

        const {
          text: [answerInSrcLang],
        } = await this.translate.translateLongText(answer.text, questionLang);

        await ctx.telegram.editMessageText(
          replyMessage.chat.id,
          replyMessage.message_id,
          undefined,
          answerInSrcLang
        );
        attempts = 5;
      } catch (e) {
        attempts++;
        console.error(e);
      }
    }
  }
}
