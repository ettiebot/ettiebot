import { randomUUID } from "crypto";
import * as timer from "timers/promises";
import type { Browser, Page } from "puppeteer";
import type {
	LogicState,
	RunPayload,
	YCApiURLQueryOpts,
	YouChatAPIResponse,
} from "../typings/YouChatLogic.typings";

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
		});

		// Get YouChat API response
		const response = await this.page.evaluate<
			[string],
			(uri: string) => Promise<YouChatAPIResponse>
		>(
			(uri) =>
				new Promise((resolve, reject) => {
					const data = { text: "", search: [], externalSearch: {} };
					const rejectTimer = setTimeout(() => reject(new Error("Timeout")), 30000);
					const es = new EventSource(uri);

					es.addEventListener("thirdPartySearchResults", (e) => {
						try {
							data.externalSearch = JSON.parse(e.data).search;
						} catch (error) {
							reject(error);
						}
					});

					es.addEventListener("youChatSerpResults", (e) => {
						try {
							data.search = JSON.parse(e.data).youChatSerpResults;
						} catch (error) {
							reject(error);
						}
					});

					es.addEventListener("youChatToken", (e) => {
						try {
							data.text += JSON.parse(e.data).youChatToken;
						} catch (error) {
							reject(error);
						}
					});

					es.addEventListener("done", () => {
						clearTimeout(rejectTimer);
						es.close();
						data.text = data.text.trim();
						resolve(data as never);
					});
				}),
			url,
		);

		return response;
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
	}

	stop(): void {
		this.state = "idle" as unknown as LogicState;
	}

	private getYCApiUrl(payload: YCApiURLQueryOpts) {
		const opts: YCApiURLQueryOpts = {
			page: 1,
			count: 3,
			safeSearch: false,
			onShoppingPage: false,
			responseFilter: "WebPages",
			domain: "youchat",
			queryTraceId: randomUUID(),
			...payload,
			history: encodeURIComponent(payload.history ?? "[]"),
		};

		const str = Object.entries(opts)
			.map(([key, val]) => `${key}=${val}`)
			.join("&");
		return `${this.ycPageUrl}/streamingSearch/?${str}`;
	}
}
