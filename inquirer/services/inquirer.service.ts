/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-void */
import type { Context, Service, ServiceSchema } from "moleculer";
import AliceClient from "ya-alice-client";
import type { IAliceActiveRequest } from "ya-alice-client/src/types";
import type { WeatherAppRoot } from "../logic/apps/weatherApp.apps";
import weatherAppApply from "../logic/apps/weatherApp.apps";
import type { WikipediaAppRoot } from "../logic/apps/wikipediaApp.apps";
import wikipediaAppApply from "../logic/apps/wikipediaApp.apps";
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
import type { ActionExecuteParams } from "./chrome.service";

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
				chatId: "string",
			},
			async handler(
				this: InquirerThis,
				ctx: Context<InquirerActionExecuteParams>,
			): Promise<InquirerActionResponse | undefined> {
				this.logger.info("exec", ctx.params);

				let text: string;
				let ycAPIResponse: YouChatAPIResponse;

				// Get history from cache
				const history =
					((await ctx.broker.cacher?.get(`${ctx.params.uid}.h`)) as InquirerHistory[]) ??
					([] as InquirerHistory[]);

				// If history is too long, clear it
				if (history.length > 3) {
					history.splice(1);
				}

				// Convert history to YouChat format
				const ycHistory = history.map((h) => ({
					question: h.q.norm[0],
					answer: h.a.orig[0],
				}));

				const ycHistoryStr = JSON.stringify(ycHistory);

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
					ycAPIResponse = await ctx.call<YouChatAPIResponse, ActionExecuteParams>(
						"Chrome.execute",
						{
							q: qEnglish.text,
							history: ycHistoryStr,
							chatId: ctx.params.chatId,
						},
					);

					const { appData } = ycAPIResponse;
					this.logger.info(appData);

					if (appData) {
						const weatherAppData = appData.find(
							(appP) => appP.ydcAppName === "weather",
						) as WeatherAppRoot;
						const wikipediaAppData = appData.find(
							(appP) => appP.ydcAppName === "wikipedia",
						) as WikipediaAppRoot;
						if (weatherAppData) {
							ycAPIResponse.text = weatherAppApply(weatherAppData);
							this.logger.info(
								"[inquirerService] weather appData",
								ycAPIResponse.text,
							);
						}
						if (wikipediaAppData) {
							ycAPIResponse.text = wikipediaAppApply(wikipediaAppData);
							this.logger.info(
								"[inquirerService] wikipedia appData",
								ycAPIResponse.text,
							);
						}
					}

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
						history: ycHistoryStr,
						chatId: ctx.params.chatId,
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

				// Get history from cache
				const history =
					((await ctx.broker.cacher?.get(`${ctx.params.uid}.h`)) as InquirerHistory[]) ??
					([] as InquirerHistory[]);

				// If history is too long, clear it
				if (history.length > 3) {
					history.splice(1);
				}

				try {
					// Translating question to English
					const qRus: TranslateResponse = await ctx.call("Translate.execute", {
						text: ctx.params.q,
						from: ctx.params.lang ?? "auto",
						to: "ru",
					});

					// Asking question
					const aliceTextRes = await this.alice.sendText(qRus.text);
					this.logger.info("[inquirerService] aliceTextRes", aliceTextRes);

					const aliceAPIResponse = aliceTextRes.text?.text;

					// Translating answer to English
					const aEng: TranslateResponse = await ctx.call("Translate.execute", {
						text: aliceAPIResponse,
						from: "ru",
						to: qRus.from,
					});

					const text = clearAnswerText(aEng.text);

					const audio = async (): Promise<IAliceActiveRequest> => {
						if (ctx.params.tts) {
							if (ctx.params.lang === "ru") {
								return this.alice.sendText(qRus.text, {
									isTTS: true,
								});
							}
							return this.alice.tts(text);
						}
						return { audioData: undefined };
					};
					const { audioData: aliceAPIResponseTTS } = await audio();
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
						audio: aliceAPIResponseTTS.audioData,
						aliceData: { ...aliceAPIResponseTTS, audioData: undefined },
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
		this.alice = new AliceClient({
			log: true,
			autoReconnect: true,
			connTimeout: 10 * 1000,
		});
		await this.alice.connect();
		await this.alice.initTTSVoice();
	},
	started(this: InquirerThis) {
		this.logger.info("Inquirer service started.");
	},
	stopped(this: InquirerThis) {
		this.alice.close();
	},
};

export default InquirerService;
