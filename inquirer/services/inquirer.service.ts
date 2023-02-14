/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-void */
import type { Context, Service, ServiceSchema } from "moleculer";
import AliceClient from "yandex-alice-client";
import type {
	InquirerActionAliceExecuteParams,
	InquirerActionAliceResponse,
	InquirerActionExecuteParams,
	InquirerActionResponse,
	InquirerHistory,
} from "../typings/Inquirer.typings";
import type { UserLanguage } from "../typings/Language.typings";
import { YandexLanguageEnum } from "../typings/Language.typings";
import type { TranslateResponse } from "../typings/Translate.typings";
import type { YouChatAPIResponse } from "../typings/YouChatLogic.typings";
import clearAnswerText from "../utils/clearAnswerText.utils";

type InquirerThis = Service<void> & { alice: AliceClient };

const InquirerService: ServiceSchema<void> = {
	name: "Inquirer",

	actions: {
		execute: {
			params: {
				q: "string",
				needTranslate: {
					type: "boolean",
					default: true,
				},
				uid: "string",
			},
			async handler(
				this: InquirerThis,
				ctx: Context<InquirerActionExecuteParams>,
			): Promise<InquirerActionResponse | undefined> {
				this.logger.info("exec", ctx.params);

				let text: string;
				let ycAPIResponse: YouChatAPIResponse;

				// Get history from cache
				let history =
					((await ctx.broker.cacher?.get(`${ctx.params.uid}.h`)) as InquirerHistory[]) ??
					([] as InquirerHistory[]);

				// Convert history to YouChat format
				let ycHistory = history.map((h) => ({
					question: h.q.norm[0],
					answer: h.a.orig[0],
				}));

				const ycHistoryStr = JSON.stringify(ycHistory);

				// If history is too long, clear it
				if (ycHistoryStr.length > 4000) {
					history = [];
					ycHistory = [];
				}

				if (ctx.params.needTranslate) {
					// Translating question to English
					const qEnglish: TranslateResponse = await ctx.call("Translate.execute", {
						text: ctx.params.q,
						from: ctx.params.lang
							? YandexLanguageEnum[ctx.params.lang as UserLanguage]
							: "auto",
						to: "en",
					});

					// Asking question
					ycAPIResponse = await ctx.call("Chrome.execute", {
						q: qEnglish.text,
						history: ycHistoryStr,
					});

					// Translating answer to English
					const aEnglish: TranslateResponse = await ctx.call("Translate.execute", {
						text: ycAPIResponse.text,
						from: "en",
						to: qEnglish.from,
					});

					text = aEnglish.text;

					// Add question to history
					history.push({
						q: {
							orig: [ctx.params.q, qEnglish.from],
							norm: [qEnglish.text, qEnglish.to],
						},
						a: {
							orig: [ycAPIResponse.text, aEnglish.from],
							norm: [aEnglish.text, aEnglish.to],
						},
					});
				} else {
					// Asking question
					ycAPIResponse = await ctx.call("Chrome.execute", {
						q: ctx.params.q,
						history: [],
					});

					text = clearAnswerText(ycAPIResponse.text);

					// Add question to history
					history.push({
						q: {
							orig: [ctx.params.q, "auto"],
							norm: [ctx.params.q, "auto"],
						},
						a: {
							orig: [ycAPIResponse.text, "auto"],
							norm: [ycAPIResponse.text, "auto"],
						},
					});
				}

				// Save history to cache
				await ctx.broker.cacher?.set(`${ctx.params.uid}.h`, history);

				return {
					text,
					search: ycAPIResponse.search,
					externalSearch: ycAPIResponse.externalSearch.third_party_search_results,
				};
			},
		},

		executeAlice: {
			params: {
				q: "string",
				uid: "string",
				tts: "boolean",
				lang: "string",
			},
			async handler(
				this: InquirerThis,
				ctx: Context<InquirerActionAliceExecuteParams>,
			): Promise<InquirerActionAliceResponse | undefined> {
				this.logger.info("exec alice tts", ctx.params);

				await this.alice.connect();

				// Get history from cache
				let history =
					((await ctx.broker.cacher?.get(`${ctx.params.uid}.h`)) as InquirerHistory[]) ??
					([] as InquirerHistory[]);

				// Convert history to YouChat format
				let ycHistory = history.map((h) => ({
					question: h.q.norm[0],
					answer: h.a.norm[0],
				}));

				// If history is too long, clear it
				if (JSON.stringify(ycHistory).length > 4000) {
					history = [];
					ycHistory = [];
				}

				try {
					// Translating question to English
					const qRus: TranslateResponse = await ctx.call("Translate.execute", {
						text: ctx.params.q,
						from: ctx.params.lang ?? "auto",
						to: "ru",
					});

					// Asking question
					const aliceTextRes = (await this.alice.sendText(qRus.text)) as {
						response: { card: { text: string } };
					};
					const aliceAPIResponse = aliceTextRes.response.card.text;

					// Translating answer to English
					const aEng: TranslateResponse = await ctx.call("Translate.execute", {
						text: aliceAPIResponse,
						from: "ru",
						to: qRus.from,
					});

					const text = clearAnswerText(aEng.text);

					const audio = async (): Promise<{ audio?: Buffer | undefined }> => {
						this.logger.info("LANG", ctx.params.lang);
						if (ctx.params.tts) {
							if (ctx.params.lang === "ru") {
								return this.alice.sendText(qRus.text, {
									isTTS: true,
								});
							}
							return { audio: await this.alice.tts(text) };
						}
						return { audio: undefined };
					};
					const { audio: aliceAPIResponseTTS } = await audio();
					this.logger.info(aliceTextRes, aliceAPIResponseTTS);

					// Add question to history
					history.push({
						q: {
							orig: [ctx.params.q, qRus.from],
							norm: [qRus.text, qRus.to],
						},
						a: {
							orig: [text, qRus.from],
							norm: [qRus.text, qRus.to],
						},
					});

					// Save history to cache
					await ctx.broker.cacher?.set(`${ctx.params.uid}.h`, history);

					return {
						text,
						audio: aliceAPIResponseTTS,
					};
				} catch (error) {
					this.logger.error(error);
					throw new Error("Unknown error");
				}
			},
		},

		executeTTS: {
			params: {
				q: "string",
			},
			async handler(
				this: InquirerThis,
				ctx: Context<InquirerActionAliceExecuteParams>,
			): Promise<InquirerActionAliceResponse | undefined> {
				this.logger.info("exec alice tts", ctx.params);

				try {
					const aliceAPIResponseTTS = await this.alice.tts(ctx.params.q);
					this.logger.info(aliceAPIResponseTTS);
					return {
						text: ctx.params.q,
						audio: aliceAPIResponseTTS,
					};
				} catch (error) {
					this.logger.error(error);
					return undefined;
				}
			},
		},
	},

	async created(this: InquirerThis) {
		// Alice
		this.alice = new AliceClient();
		await this.alice.connect();

		// Handle unhandled rejections
		process.on("unhandledRejection", (err, promise) => {
			this.logger.error("Unhandled rejection (promise: ", promise, ", reason: ", err, ").");
		});

		process.on("uncaughtException", (error, origin) => {
			this.logger.error("----- Uncaught exception -----");
			this.logger.error(error);
			this.logger.error("----- Exception origin -----");
			this.logger.error(origin);
			this.alice.close();
			this.alice = new AliceClient();
			void this.alice.connect();
		});
	},
	started(this: InquirerThis) {
		this.logger.info("Inquirer service started.");
	},
	stopped(this: InquirerThis) {
		this.alice.close();
	},
};

export default InquirerService;
