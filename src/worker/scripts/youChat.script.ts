import { delay } from "bullmq";
import { Browser, Page } from "puppeteer";
import { MessagesHistoryItem } from "../../types";
import { cleanHistory } from "../../utils";
import { YOUCHAT_API_URL } from "../env";

export default class YouChatScript {
  browser: Browser;
  page: Page | undefined;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async init() {
    console.info("[YC] Initializing...");

    this.page = await this.browser.newPage();
    await this.page.goto("https://you.com/api", {
      waitUntil: "networkidle0",
    });

    console.info("[YC] Waiting for page to load...");

    // Bypass Cloudflare if needed
    await this._bypassCF();

    console.info("[YC] Page loaded");
  }

  private async _bypassCF() {
    if (!this.page) return;

    const noJs = await this.page.$(".no-js");

    if (noJs) {
      console.info("[YC] No JS detected, trying to bypass...");
      await delay(1000);

      try {
        await this.page.waitForSelector(".big-button.pow-button", {
          timeout: 5000,
        });
        const verifyBtn = await this.page.$(".big-button.pow-button");
        if (verifyBtn) {
          await delay(1000);
          await verifyBtn.click();
          console.info("[YC] Verify button clicked");
        }
      } catch (_) {}

      try {
        await this.page.waitForSelector("iframe", { timeout: 5000 });
        const iframe = await this.page.$("iframe");
        if (iframe) {
          console.info("[YC] Iframe detected, trying to bypass...");
          await delay(2000);
          const frame = this.page
            .frames()
            .find((frame) => frame.url().indexOf("challenges") !== -1);
          await frame?.click("input[type='checkbox']");
        }
      } catch (_) {}
    }

    await this.page.waitForSelector("#__next", { timeout: 30000 });
  }

  async askQuestion(
    question: string,
    history: MessagesHistoryItem[] = []
  ): Promise<string> {
    if (!this.page) return "error";

    console.info("[YC] Asking question '" + question + "'...");

    // Retreive answer from AI
    const url = YOUCHAT_API_URL.replace(
      "{q}",
      encodeURIComponent(question)
    ).replace("{h}", encodeURIComponent(JSON.stringify(cleanHistory(history))));

    const data: string = await this.page.evaluate((uri): Promise<string> => {
      return new Promise((resolve, reject) => {
        let data = "";

        const rejectTimer = setTimeout(
          () => reject(new Error("[YC -> askQuestion()] Request timeout")),
          30000
        );

        const es = new EventSource(uri);

        es.addEventListener("youChatToken", (e) => {
          try {
            console.log(e.data);
            data += JSON.parse(e.data).youChatToken;
          } catch (e) {
            reject(e);
          }
        });

        es.addEventListener("done", () => {
          console.info("DONE");
          clearTimeout(rejectTimer);
          es.close();
          resolve(data);
        });
      });
    }, url);

    if (!data) throw "Answer is empty";

    console.info("[YC] Answer: " + data);
    return data;
  }
}
