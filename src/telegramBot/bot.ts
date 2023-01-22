import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { Telegraf } from "telegraf";
import { WorkerAskMethodPayload, WorkerAskMethodResponse } from "../types";
import { MENTION_PREDICT, MENTION_PREDICT_REGEXP } from "./const";
import {
  REDIS_HOST,
  REDIS_PORT,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
} from "./env";
import History from "./history";
import { QueueTask, TypegramMessage } from "./types";
import { Job, Queue, QueueEvents, Worker } from "bullmq";
import { ServiceBroker } from "moleculer";

export default class TelegramBot {
  public bot: Telegraf;
  private redisClient = new Redis({
    enableOfflineQueue: false,
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  private limiter = new RateLimiterRedis({
    points: 1,
    duration: 10,
    storeClient: this.redisClient,
  });
  private queue = new Queue("tg", {
    defaultJobOptions: {
      removeOnComplete: false,
    },
    connection: this.redisClient,
  });
  private worker = new Worker(
    "tg",
    async (job) => await this._pullToQueue(job.data),
    {
      concurrency: 2,
      runRetryDelay: 10000,
      limiter: {
        max: 2,
        duration: 10000,
      },
    }
  );
  private queueEvents = new QueueEvents("tg");
  private history = new History(this.redisClient);
  private service = new ServiceBroker({
    transporter: "redis://" + REDIS_HOST + ":" + REDIS_PORT,
    nodeID: "ettieTelegramClient-" + Date.now().toString(36),
  });

  public ownerChatId = 5430459394;
  private lastMessages: string[] = [];

  constructor(bot = new Telegraf(TELEGRAM_BOT_TOKEN)) {
    this.bot = bot;
    this.worker.on(
      "failed",
      (job: Job<any, any, string> | undefined, error: Error, prev: string) => {
        console.error(job, error);
        this.bot.telegram.sendMessage(
          this.ownerChatId,
          "error\nname:" +
            error.name +
            "\nmessage:" +
            error.message +
            "\nstack:" +
            error.stack
        );
      }
    );
  }

  async start() {
    await this.service.start();
    this.listen();
    await this.bot.launch();
    console.info("Telegram bot has been started");
  }

  private listen() {
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
          parse_mode: "Markdown",
        }
      );
    }

    // Push a task to queue and retreive response
    const job = await this.queue.add(
      "tg",
      {
        question,
        ctx: {
          chatId: ctx.chat.id,
          userId: ctx.message.from.id,
          messageId: ctx.message.message_id,
        },
      },
      {
        delay: 3000,
      }
    );
    console.log("Queued");

    await job.waitUntilFinished(this.queueEvents);
    console.log("Done", job.id);

    if (!job.id) return;

    const resolvedJob = await Job.fromId(this.queue, job.id);
    if (!resolvedJob) return;

    const { returnvalue: res }: { returnvalue: WorkerAskMethodResponse } =
      resolvedJob;

    if (!res?.question) return false;

    // Push question to history
    await this.history.push(dialogKey, {
      question: res.question.questionEN,
      answer: res.answer.textEN,
    });

    return true;
  }

  private async writeReply(
    question: string,
    ctx: QueueTask["ctx"]
  ): Promise<WorkerAskMethodResponse | null> {
    const message = await this.bot.telegram.sendMessage(ctx.chatId, "✍️ ...", {
      reply_to_message_id: ctx.messageId,
      parse_mode: "Markdown",
    });

    // await this.bot.telegram.sendChatAction(ctx.chatId, "typing");
    // await delay(2000);

    console.info("call worker.ask", question);

    try {
      const history = await this.history.get(ctx.chatId + "." + ctx.userId);

      const response = await this.service.call<
        WorkerAskMethodResponse,
        WorkerAskMethodPayload
      >("worker.ask", {
        question,
        history,
      });

      console.info("response", response);

      await this.bot.telegram.editMessageText(
        ctx.chatId,
        message.message_id,
        undefined,
        response.answer.text,
        {
          parse_mode: "Markdown",
        }
      );

      return response;
    } catch (e) {
      console.error(e);
      await this.bot.telegram.editMessageText(
        ctx.chatId,
        message.message_id,
        undefined,
        "❌ Error occured"
      );
      return null;
    }
  }

  private async _pullToQueue(
    data: any
  ): Promise<WorkerAskMethodResponse | null> {
    const { question, ctx }: QueueTask = data;
    return await this.writeReply(question, ctx);
  }
}
