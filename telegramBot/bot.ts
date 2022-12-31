import fastq from "fastq";
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
  private queue = fastq.promise<any, QueueTask, WorkerAskMethodResponse>(
    this,
    this._pullToQueue,
    2
  );
  private history = new History(this.redisClient);

  constructor(network: Network, bot = new Telegraf(TELEGRAM_BOT_TOKEN)) {
    this.network = network;
    this.bot = bot;
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
    if (!message.text) return false;

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
    const res = await this.queue.push({ question, ctx });
    // Push question to history
    await this.history.push(dialogKey, {
      question: res.question.questionEN,
      answer: res.answer.textEN,
    });

    return true;
  }

  private async writeReply(
    question: string,
    ctx: TypegramMessage
  ): Promise<WorkerAskMethodResponse> {
    return await new TPromise((resolve, reject) => {
      let done = false;

      RunParallel([
        async () => {
          await retry(
            async () => {
              if (!done) {
                await ctx.sendChatAction("typing");
                await delay(2000);
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

                const response = await this.network.ask({
                  question,
                  history: [],
                });

                await ctx.reply(response.answer.text, {
                  reply_to_message_id: ctx.message.message_id,
                });

                done = true;

                cb(null, true);
                resolve(response);
                console.info("done");
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
            reject(e);
          });
        },
      ]);
    });
  }

  private async _pullToQueue({
    question,
    ctx,
  }: QueueTask): Promise<WorkerAskMethodResponse> {
    return await this.writeReply(question, ctx);
  }
}
