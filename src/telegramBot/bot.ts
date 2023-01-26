import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { Telegraf } from "telegraf";
import { WorkerAskMethodPayload, WorkerAskMethodResponse } from "../types";
import { MENTION_PREDICT, MENTION_PREDICT_REGEXP } from "./const";
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
} from "./env";
import History from "./history";
import { QueueTask, TypegramInlineQuery, TypegramMessage } from "./types";
import { ServiceBroker } from "moleculer";
import PQueue from "p-queue";

export default class TelegramBot {
  public bot: Telegraf;
  private redisClient: Redis;
  private limiter: RateLimiterRedis;
  private history: History;

  private questionsQueue = new PQueue({
    concurrency: 1,
    timeout: 60 * 1000,
    interval: 5000,
    intervalCap: 2,
  });

  private lastMessages: string[] = [];

  private service = new ServiceBroker({
    transporter:
      "redis://" +
      (REDIS_PASSWORD ? REDIS_PASSWORD + "@" : "") +
      REDIS_HOST +
      ":" +
      REDIS_PORT,
    nodeID: "ettieTelegramClient-" + Date.now().toString(36),
  });

  constructor(bot = new Telegraf(TELEGRAM_BOT_TOKEN)) {
    this.bot = bot;

    console.info("Connecting to Redis...");
    this.redisClient = new Redis({
      enableOfflineQueue: false,
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    });

    console.info("Initializing history...");
    this.history = new History(this.redisClient);

    console.info("Initializing rate limiter...");
    this.limiter = new RateLimiterRedis({
      points: 1,
      duration: 10,
      storeClient: this.redisClient,
    });
  }

  async start() {
    await this.service.start();
    this.listen();
    await this.bot.launch();
    console.info("Telegram bot has been started");
  }

  private listen() {
    this.bot.on("inline_query", (ctx) => this.onInlineQuery(ctx));

    this.bot.on("chosen_inline_result", ({ chosenInlineResult }) => {
      console.log("chosen inline result", chosenInlineResult);
    });

    this.bot.on("message", (ctx: any) => this.onMessage(ctx));
  }

  private async onMessage(ctx: TypegramMessage) {
    const dialogKey = ctx.message.chat.id + "." + ctx.message.from.id;
    const { message } = ctx;

    // Check what message have a text
    if (!message.text || message.text.length > 150) return false;

    const matchRegexp = message.text.match(MENTION_PREDICT_REGEXP);
    const mentionPredict = matchRegexp
      ? Object.values(matchRegexp)[0]
          ?.toLowerCase()
          ?.trim()
          .replace(/[^\p{L}\p{N}\s]/u, "")
      : null;

    let question: string = message.text.trim();

    // If first word of text equals any specified kind of mention
    if (mentionPredict && MENTION_PREDICT.indexOf(mentionPredict) !== -1) {
      // Remove mention from message text
      question = message.text.replace(MENTION_PREDICT_REGEXP, "").trim();
    } else if (
      message.chat.id < 0 &&
      (!message.reply_to_message ||
        message.reply_to_message.from?.username !== TELEGRAM_BOT_USERNAME ||
        (message.reply_to_message && message.text.indexOf("?") === -1))
    )
      return;

    // Rate limiter
    try {
      await this.limiter.consume(dialogKey, 1);
      if (this.lastMessages.length + 1 > 5) this.lastMessages = [];
      this.lastMessages.push(dialogKey);
    } catch (e) {
      if (this.lastMessages.filter((m) => m === dialogKey).length > 2)
        await this.limiter.penalty(dialogKey, 5);
      return await this.bot.telegram.sendMessage(
        ctx.message.chat.id,
        "⚠️ You are sending messages too fast. Please, wait a bit and try again later.",
        {
          reply_to_message_id: message.message_id,
        }
      );
    }

    // Push a task to queue and retreive response
    const res = await this.questionsQueue.add(
      async () =>
        await this._pullToQueue({
          question,
          ctx: {
            chatId: ctx.chat.id,
            userId: ctx.message.from.id,
            messageId: ctx.message.message_id,
          },
        })
    );

    if (!res?.question) return false;

    // Push question to history
    await this.history.push(dialogKey, {
      question: res.question.questionEN,
      answer: res.answer.textEN,
    });

    return true;
  }

  private async onInlineQuery(ctx: TypegramInlineQuery) {
    const dialogKey = "inline." + ctx.inlineQuery.from.id;

    // Check what message have a text
    if (
      !ctx.inlineQuery.query ||
      ctx.inlineQuery.query.length > 100 ||
      (ctx.inlineQuery.query[ctx.inlineQuery.query.length - 1] !== "?" &&
        ctx.inlineQuery.query[ctx.inlineQuery.query.length - 1] !== "!" &&
        ctx.inlineQuery.query[ctx.inlineQuery.query.length - 1] !== ".")
    )
      return false;

    const question = ctx.inlineQuery.query.trim();

    try {
      // Rate limiter
      try {
        await this.limiter.consume(dialogKey, 1);
        if (this.lastMessages.length + 1 > 5) this.lastMessages = [];
        this.lastMessages.push(dialogKey);
      } catch (e) {
        if (this.lastMessages.filter((m) => m === dialogKey).length > 2)
          await this.limiter.penalty(dialogKey, 5);
        return false;
      }

      // Push a task to queue and retreive response
      const res = await this.questionsQueue.add(
        async () =>
          await this._pullToQueue({
            question,
            ctx: {
              userId: ctx.inlineQuery.from.id,
              isInline: true,
            },
          })
      );

      if (!res?.question) return false;

      // Push question to history
      await this.history.push(dialogKey, {
        question: res.question.questionEN,
        answer: res.answer.textEN,
      });

      return await ctx.answerInlineQuery([
        {
          type: "article",
          id: "ask",
          title: "Send reply to chat:",
          description: res.answer.text,
          input_message_content: {
            message_text: res.answer.text,
          },
        },
      ]);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private async writeReply(
    question: QueueTask["question"],
    ctx: QueueTask["ctx"]
  ): Promise<WorkerAskMethodResponse | null> {
    const message =
      !ctx.isInline && ctx.chatId
        ? await this.bot.telegram.sendMessage(ctx.chatId, "✍️ ...", {
            reply_to_message_id: ctx.messageId,
          })
        : null;

    try {
      console.log(question.length);
      if (ctx.isInline && question.length < 15)
        throw new Error("Too short question");

      const history = await this.history.get(
        (ctx.chatId ?? "inline") + "." + ctx.userId
      );

      const response = await this.service.call<
        WorkerAskMethodResponse,
        WorkerAskMethodPayload
      >("worker.ask", {
        question,
        history,
      });

      if (!ctx.isInline && ctx.chatId)
        await this.bot.telegram.editMessageText(
          ctx.chatId,
          message?.message_id,
          undefined,
          response.answer.text
        );

      console.info("response", response);

      return response;
    } catch (e: any) {
      if (!ctx.isInline && ctx.chatId) {
        await this.bot.telegram.editMessageText(
          ctx.chatId,
          message?.message_id,
          undefined,
          "❌ " + e.toString()
        );

        return null;
      } else
        return {
          question: {
            question,
            questionEN: question,
            lang: "auto",
          },
          answer: {
            text: "❌ " + e.toString(),
            textEN: "❌ Error occured",
            lang: "en",
          },
        };
    }
  }

  private async _pullToQueue(
    data: any
  ): Promise<WorkerAskMethodResponse | null> {
    console.info("PULL");
    const { question, ctx }: QueueTask = data;
    return await this.writeReply(question, ctx)
      .then((r) => r)
      .catch((e) => e.toString());
  }
}
