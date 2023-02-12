/* eslint-disable @typescript-eslint/no-misused-promises */
import { readFileSync } from "fs";
import { SpeechClient } from "@google-cloud/speech";
import { Storage } from "@google-cloud/storage";
import BeeQueue from "bee-queue";
import i18next from "i18next";
import type { Service, ServiceSchema } from "moleculer";
import TelegramBot from "node-telegram-bot-api";
import * as langs from "../../i18n";
import * as methods from "../../methods";
import type { InquirerJobPayload } from "../../typings/Inquirer.typings";

interface TelegramBotSettings {
	inquirerQueue: BeeQueue.QueueSettings;
}

interface TelegramBotMethods {
	listenEvents(): void;
}

interface TelegramBotLocalVars {
	bot: TelegramBot;
	inquirer: BeeQueue<InquirerJobPayload>;
	gcSpeech: SpeechClient;
	gcStorage: Storage;
}

export type TelegramBotThis = Service<TelegramBotSettings> &
	TelegramBotMethods &
	TelegramBotLocalVars;

const TelegramBotService: ServiceSchema<TelegramBotSettings> = {
	name: "TelegramBot",

	settings: {
		inquirerQueue: {
			prefix: "etclinq",
			redis: process.env.CACHER,
			removeOnSuccess: false,
			removeOnFailure: true,
		},
	},

	methods: {
		listenEvents(this: TelegramBotThis) {
			// On starting a chat
			this.bot.onText(/\/start/, methods.onChatStart.bind(this));
			// On main menu
			this.bot.onText(/\/menu/, methods.onMainMenuBtn.bind(this));
			// On voice message
			this.bot.on("voice", methods.onVoiceMessage.bind(this));
			// On callback query
			this.bot.on("callback_query", methods.onCallbackQuery.bind(this));
			// On text message
			this.bot.on("text", methods.onTextMessage.bind(this));
			// On inline query
			this.bot.on("inline_query", methods.onInlineQuery.bind(this));
		},
	},

	async created(this: TelegramBotThis) {
		// Init Telegram bot
		this.bot = new TelegramBot(`${process.env.TELEGRAM_BOT_TOKEN}`, { polling: true });
		// Init localization
		await i18next.init({
			fallbackLng: ["en"],
			debug: true,
			resources: {
				en: {
					translation: langs.enUS,
				},
				ru: {
					translation: langs.ruRU,
				},
				ua: {
					translation: langs.uaUA,
				},
			},
		});
		// Init Inquirer queue
		this.inquirer = new BeeQueue("inquirer", this.settings.inquirerQueue);
		this.inquirer.process(methods.onInquirerJob.bind(this));
		// Init Google Cloud
		const credentials = JSON.parse(readFileSync("gcCredentials.json", "utf-8"));
		this.gcSpeech = new SpeechClient({
			credentials,
		});
		this.gcStorage = new Storage({
			credentials,
		});
	},

	started(this: TelegramBotThis) {
		this.listenEvents();
	},

	async stopped(this: TelegramBotThis) {
		await this.bot.stopPolling();
	},
};

export default TelegramBotService;
