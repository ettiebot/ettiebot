import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import RunParallel from "run-parallel";
import { Telegraf } from "telegraf";
import TPromise from "thread-promises";
import { retry } from "ts-retry-promise";
import { WorkerAskMethodResponse } from "../shared/types";
import { delay } from "../utils";
import { MENTION_PREDICT, MENTION_PREDICT_REGEXP } from "./const";
import {
  REDIS_HOST,
  REDIS_PORT,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
} from "./env";
import History from "./history";
import { Network } from "./network";
import { QueueTask, TypegramMessage } from "./types";
import { Job, Queue, QueueEvents, Worker } from "bullmq";

export default class TelegramBot {
  private network: Network;
  public bot: Telegraf;
  private redisClient = new Redis({
    enableOfflineQueue: false,
    host: REDIS_HOST,
    port: REDIS_PORT,
  });
  private limiter = new RateLimiterRedis({
    points: 1,
    duration: 5,
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
      runRetryDelay: 5000,
      limiter: {
        max: 2,
        duration: 6000,
      },
    }
  );
  private queueEvents = new QueueEvents("tg");
  private history = new History(this.redisClient);

  public ownerChatId = 5430459394;

  constructor(network: Network, bot = new Telegraf(TELEGRAM_BOT_TOKEN)) {
    this.network = network;
    this.bot = bot;
    this.worker.on("failed", (job: Job, error: Error) => {
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
    });
  }

  async start() {
    this.listen();
    await this.bot.launch();
    console.info("Telegram bot has been started");
  }

  private listen() {
    this.bot.on("message", (ctx: TypegramMessage) => this.onMessage(ctx));
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
        message.reply_to_message.from.username !== TELEGRAM_BOT_USERNAME ||
        (message.reply_to_message && message.text.indexOf("?") === -1))
    )
      return;

    // Rate limiter
    try {
      await this.limiter.consume(dialogKey, 1);
    } catch (e) {
      return console.info("rate_limit " + dialogKey);
    }

    // Push a task to queue and retreive response
    const job = await this.queue.add("tg", {
      question,
      ctx: {
        chatId: ctx.chat.id,
        userId: ctx.message.from.id,
        messageId: ctx.message.message_id,
      },
    });
    console.log("Queued");

    await job.waitUntilFinished(this.queueEvents);
    console.log("Done", job.id);

    const { returnvalue: res }: { returnvalue: WorkerAskMethodResponse } =
      await Job.fromId(this.queue, job.id);

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
  ): Promise<WorkerAskMethodResponse> {
    return await new TPromise((resolve, reject) => {
      let done = false;

      RunParallel([
        async () => {
          await retry(
            async () => {
              if (!done) {
                await this.bot.telegram.sendChatAction(ctx.chatId, "typing");
                await delay(2000);
                throw new Error();
              } else return true;
            },
            { retries: 100 }
          );
        },
        async (cb) => {
          try {
            console.log("started");

            const response = await this.network.ask({
              question,
              history: [],
            });

            await this.bot.telegram.sendMessage(
              ctx.chatId,
              response.answer.text,
              {
                reply_to_message_id: ctx.messageId,
              }
            );

            done = true;

            cb(null, true);
            resolve(response);
            console.info("done");
          } catch (e) {
            console.error(e);
            throw e;
          }
        },
      ]);
    });
  }

  private async _pullToQueue(data: any): Promise<WorkerAskMethodResponse> {
    const { question, ctx }: QueueTask = data;
    console.log(data);
    return await this.writeReply(question, ctx);
  }
}
