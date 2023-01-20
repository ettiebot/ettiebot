"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const run_parallel_1 = __importDefault(require("run-parallel"));
const telegraf_1 = require("telegraf");
const thread_promises_1 = __importDefault(require("thread-promises"));
const ts_retry_promise_1 = require("ts-retry-promise");
const utils_1 = require("../utils");
const const_1 = require("./const");
const env_1 = require("./env");
const history_1 = __importDefault(require("./history"));
const bullmq_1 = require("bullmq");
class TelegramBot {
    constructor(network, bot = new telegraf_1.Telegraf(env_1.TELEGRAM_BOT_TOKEN)) {
        this.redisClient = new ioredis_1.default({
            enableOfflineQueue: false,
            host: env_1.REDIS_HOST,
            port: env_1.REDIS_PORT,
        });
        this.limiter = new rate_limiter_flexible_1.RateLimiterRedis({
            points: 1,
            duration: 5,
            storeClient: this.redisClient,
        });
        this.queue = new bullmq_1.Queue("tg", {
            defaultJobOptions: {
                removeOnComplete: false,
            },
            connection: this.redisClient,
        });
        this.worker = new bullmq_1.Worker("tg", (job) => __awaiter(this, void 0, void 0, function* () { return yield this._pullToQueue(job.data); }), {
            concurrency: 2,
            runRetryDelay: 10000,
            limiter: {
                max: 2,
                duration: 10000,
            },
        });
        this.queueEvents = new bullmq_1.QueueEvents("tg");
        this.history = new history_1.default(this.redisClient);
        this.ownerChatId = 5430459394;
        this.network = network;
        this.bot = bot;
        this.worker.on("failed", (job, error, prev) => {
            console.error(job, error);
            this.bot.telegram.sendMessage(this.ownerChatId, "error\nname:" +
                error.name +
                "\nmessage:" +
                error.message +
                "\nstack:" +
                error.stack);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.listen();
            yield this.bot.launch();
            console.info("Telegram bot has been started");
        });
    }
    listen() {
        this.bot.on("message", (ctx) => this.onMessage(ctx));
    }
    onMessage(ctx) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const dialogKey = ctx.message.chat.id + "." + ctx.message.from.id;
            const { message } = ctx;
            // Check what message have a text
            if (!message.text || message.text.length > 150)
                return false;
            const matchRegexp = message.text.match(const_1.MENTION_PREDICT_REGEXP);
            const mentionPredict = matchRegexp
                ? (_b = (_a = Object.values(matchRegexp)[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.trim().replace(/[^\p{L}\p{N}\s]/u, "")
                : null;
            let question = message.text.trim();
            // If first word of text equals any specified kind of mention
            if (mentionPredict && const_1.MENTION_PREDICT.indexOf(mentionPredict) !== -1) {
                // Remove mention from message text
                question = message.text.replace(const_1.MENTION_PREDICT_REGEXP, "").trim();
            }
            else if (message.chat.id < 0 &&
                (!message.reply_to_message ||
                    ((_c = message.reply_to_message.from) === null || _c === void 0 ? void 0 : _c.username) !== env_1.TELEGRAM_BOT_USERNAME ||
                    (message.reply_to_message && message.text.indexOf("?") === -1)))
                return;
            // Rate limiter
            try {
                yield this.limiter.consume(dialogKey, 1);
            }
            catch (e) {
                return console.info("rate_limit " + dialogKey);
            }
            // Push a task to queue and retreive response
            const job = yield this.queue.add("tg", {
                question,
                ctx: {
                    chatId: ctx.chat.id,
                    userId: ctx.message.from.id,
                    messageId: ctx.message.message_id,
                },
            }, {
                delay: 3000,
            });
            console.log("Queued");
            yield job.waitUntilFinished(this.queueEvents);
            console.log("Done", job.id);
            if (!job.id)
                return;
            const resolvedJob = yield bullmq_1.Job.fromId(this.queue, job.id);
            if (!resolvedJob)
                return;
            const { returnvalue: res } = resolvedJob;
            // Push question to history
            yield this.history.push(dialogKey, {
                question: res.question.questionEN,
                answer: res.answer.textEN,
            });
            return true;
        });
    }
    writeReply(question, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new thread_promises_1.default((resolve, reject) => {
                let done = false;
                (0, run_parallel_1.default)([
                    () => __awaiter(this, void 0, void 0, function* () {
                        yield (0, ts_retry_promise_1.retry)(() => __awaiter(this, void 0, void 0, function* () {
                            if (!done) {
                                yield this.bot.telegram.sendChatAction(ctx.chatId, "typing");
                                yield (0, utils_1.delay)(2000);
                                throw new Error();
                            }
                            else
                                return true;
                        }), { retries: 100 });
                    }),
                    (cb) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            console.log("started");
                            const response = yield this.network.ask({
                                question,
                                history: [],
                            });
                            yield this.bot.telegram.sendMessage(ctx.chatId, response.answer.text, {
                                reply_to_message_id: ctx.messageId,
                            });
                            done = true;
                            cb(null, true);
                            resolve(response);
                            console.info("done");
                        }
                        catch (e) {
                            console.error(e);
                            throw e;
                        }
                    }),
                ]);
            });
        });
    }
    _pullToQueue(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { question, ctx } = data;
            console.log(data);
            return yield this.writeReply(question, ctx);
        });
    }
}
exports.default = TelegramBot;
