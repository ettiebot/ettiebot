import getAppDataPath from "appdata-path";
import type { Context, Service, ServiceSchema } from "moleculer";
import puppeteer from "puppeteer";
import type { Browser } from "puppeteer";
import YouChatLogic from "../logic/youChat.logic";
import type { YouChatAPIResponse } from "../typings/YouChatLogic.typings";

export interface ActionExecuteParams {
	q: string;
	history: string;
	chatId: string;
}

interface ChromeSettings {
	defaultName: string;
	browser: {
		headless: boolean;
		args: string[];
		executablePath: string | undefined;
	};
}

interface ChromeMethods {
	startBrowser(): Promise<void>;
	stopBrowser(): Promise<void>;
	listenEvents(): void;
}

interface ChromeLocalVars {
	browser: Browser;
	youChatLogic: YouChatLogic;
}

type ChromeThis = Service<ChromeSettings> & ChromeMethods & ChromeLocalVars;

const ChromeService: ServiceSchema<ChromeSettings> = {
	name: "Chrome",

	settings: {
		defaultName: "Moleculer",
		browser: {
			headless: false,
			args: [
				`--user-data-dir=${getAppDataPath(process.env.NAMESPACE ?? "bot")}`,
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-sync",
				"--disable-default-apps",
				"--disable-extensions",
				"--disable-translate",
				"--no-experiments",
			],
			executablePath: process.env.CHROME_PATH,
		},
	},

	actions: {
		execute: {
			params: {
				q: "string",
				history: {
					type: "string",
					default: "[]",
				},
				chatId: "string",
			},
			async handler(
				this: ChromeThis,
				ctx: Context<ActionExecuteParams>,
			): Promise<YouChatAPIResponse> {
				return this.youChatLogic.run(ctx.params);
			},
		},
	},

	methods: {
		// Start browser
		async startBrowser(this: ChromeThis) {
			this.browser = await puppeteer.launch(this.settings.browser);
			this.listenEvents();
			await this.initLogic();
			this.logger.info("Browser is ready");
		},

		// Init logic classes
		async initLogic(this: ChromeThis) {
			// Init YouChat logic
			this.youChatLogic = new YouChatLogic(this.browser);
			await this.youChatLogic.init();
		},

		// Listen browser events
		listenEvents(this: ChromeThis) {
			// Listen for browser disconnection
			this.browser.once("disconnected", () => {
				this.logger.error("Re-running browser...");
				// eslint-disable-next-line no-void
				void this.startBrowser();
			});
		},

		// Stop browser
		async stopBrowser(this: ChromeThis) {
			// Stop YouChat logic
			// eslint-disable-next-line @typescript-eslint/await-thenable
			await this.youChatLogic.stop();
		},
	},

	created(this: ChromeThis) {},
	async started(this: ChromeThis) {
		// Start browser
		await this.startBrowser();
	},
	async stopped(this: ChromeThis) {
		// Stop browser
		await this.stopBrowser.bind(this)();
	},
};

export default ChromeService;
