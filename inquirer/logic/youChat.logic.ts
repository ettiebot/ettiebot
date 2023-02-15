import { randomUUID } from "crypto";
import * as timer from "timers/promises";
import type { Browser, Page } from "puppeteer";
import type {
	LogicState,
	RunPayload,
	YCApiURLQueryOpts,
	YouChatAPIResponse,
} from "../typings/YouChatLogic.typings";

const resolveRequest = async (url: string) => {
	const $r = await new Promise((resolve, reject) => {
		const data = { text: "", search: [], slots: [], externalSearch: {}, appData: [] };
		const es = new EventSource(url);

		es.addEventListener("slots", (e) => {
			data.slots = JSON.parse(e.data).slot_dictionary;
		});

		es.addEventListener("youChatToken", (e) => {
			data.text += JSON.parse(e.data).youChatToken;
		});

		es.addEventListener("done", () => {
			es.close();
			data.text = data.text.trim();
			resolve(data as never);
		});

		es.addEventListener("thirdPartySearchResults", (e) => {
			data.externalSearch = JSON.parse(e.data).search;
		});

		es.addEventListener("youChatSerpResults", (e) => {
			data.search = JSON.parse(e.data).youChatSerpResults;
		});

		es.addEventListener("appData", (e) => {
			data.appData.push(JSON.parse(e.data) as never);
		});

		es.onerror = (e) => {
			console.error(e);
			es.close();
			reject(e);
		};
	});

	return $r;
};

export default class YouChatLogic {
	private browser: Browser;

	private page?: Page;

	private state: LogicState = "idle" as unknown as LogicState;

	private ycPageUrl = "https://you.com/api";

	private selectors = {
		// Cloudflare selectors
		cfCheckPage: ".no-js",
		cfVerifyBtn: ".big-button.pow-button",
		cfCaptchaFrame: "iframe",
		cfCaptchaCheckbox: "input[type='checkbox']",
		// YouChat selectors
		ycPage: "#__next",
	};

	constructor(browser: Browser) {
		this.browser = browser;
	}

	async run(payload: RunPayload): Promise<YouChatAPIResponse> {
		if (!this.page || this.state !== ("loaded" as unknown as LogicState)) {
			throw new Error("Browser is not loaded");
		}

		// Get YouChat API URL
		const url = this.getYCApiUrl({
			q: payload.q,
			history: payload.history,
			chatId: payload.history.length > 2 ? payload.chatId : undefined,
		});

		// Get YouChat API response
		// eslint-disable-next-line
		return (await this.page.evaluate(
			// eslint-disable-next-line
			resolveRequest,
			url,
		)) as unknown as YouChatAPIResponse;
	}

	async init(): Promise<void> {
		this.state = "loaded" as unknown as LogicState;
		// Open page
		[this.page] = await this.browser.pages();
		// Go to page
		await this.page.goto(this.ycPageUrl, {
			waitUntil: "networkidle0",
		});
		// Do checks
		await this.waitPageForLoad();
	}

	async exposeResolver(): Promise<void> {
		await this.page?.exposeFunction("resolveRequest", resolveRequest);
	}

	async waitPageForLoad(): Promise<void> {
		if (!this.page) {
			throw new Error("Page is not loaded");
		}

		// Cloudflare check page selector
		const noJs = await this.page.$(this.selectors.cfCheckPage);

		// If Cloudflare check page is present
		if (noJs) {
			await timer.setTimeout(1000);

			try {
				// Wait for Cloudflare verify button
				await this.page.waitForSelector(this.selectors.cfVerifyBtn, {
					timeout: 5000,
				});

				// Click Cloudflare verify button
				const verifyBtn = await this.page.$(this.selectors.cfVerifyBtn);
				if (verifyBtn) {
					await Promise.all([timer.setTimeout(1000), verifyBtn.click()]);
				}
			} catch (_) {
				// Do nothing
			}

			try {
				// Wait for Cloudflare captcha iframe
				await this.page.waitForSelector(this.selectors.cfCaptchaFrame, { timeout: 5000 });
				const iframe = await this.page.$(this.selectors.cfCaptchaFrame);

				if (iframe) {
					await timer.setTimeout(2000);

					// Find Cloudflare captcha iframe
					const frame = this.page
						.frames()
						.find((f) => f.url().indexOf("challenges") !== -1);

					// Click Cloudflare captcha checkbox
					if (frame) {
						await frame.click(this.selectors.cfCaptchaCheckbox);
					}
				}
			} catch (_) {
				// Do nothing
			}
		}

		// Wait for YouChat page selector
		await this.page.waitForSelector(this.selectors.ycPage, { timeout: 30000 });
		await this.exposeResolver();
	}

	async stop(): Promise<void> {
		this.state = "idle" as unknown as LogicState;
		await this.browser.close();
	}

	private getYCApiUrl(payload: YCApiURLQueryOpts) {
		const opts: YCApiURLQueryOpts = {
			page: 1,
			count: 3,
			safeSearch: "Off",
			onShoppingPage: false,
			mkt: "",
			responseFilter: "WebPages,Translations,TimeZone,Computation,RelatedSearches",
			domain: "youchat",
			queryTraceId: payload.chatId ?? randomUUID(),
			...payload,
			chatId: payload.history && payload.history.length > 2 ? payload.chatId : undefined,
			history: encodeURIComponent(payload.history ?? "[]"),
		};

		const str = Object.entries(opts)
			.map(([key, val]) => `${key}=${val}`)
			.join("&");
		return `${this.ycPageUrl}/streamingSearch?${str}`;
	}
}
