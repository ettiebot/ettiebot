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
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const env_1 = require("../env");
class YouChatScript {
    constructor(browser) {
        this.browser = browser;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.info("[YC] Initializing...");
            this.page = yield this.browser.newPage();
            yield this.page.goto("https://you.com/api", {
                waitUntil: "networkidle0",
            });
            console.info("[YC] Waiting for page to load...");
            // Bypass Cloudflare if needed
            yield this._bypassCF();
            console.info("[YC] Page loaded");
        });
    }
    _bypassCF() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            const noJs = yield this.page.$(".no-js");
            if (noJs) {
                console.info("[YC] No JS detected, trying to bypass...");
                yield (0, bullmq_1.delay)(1000);
                try {
                    yield this.page.waitForSelector(".big-button.pow-button", {
                        timeout: 5000,
                    });
                    const verifyBtn = yield this.page.$(".big-button.pow-button");
                    if (verifyBtn) {
                        yield (0, bullmq_1.delay)(1000);
                        yield verifyBtn.click();
                        console.info("[YC] Verify button clicked");
                    }
                }
                catch (_) { }
                try {
                    yield this.page.waitForSelector("iframe", { timeout: 5000 });
                    const iframe = yield this.page.$("iframe");
                    if (iframe) {
                        console.info("[YC] Iframe detected, trying to bypass...");
                        yield (0, bullmq_1.delay)(2000);
                        const frame = this.page
                            .frames()
                            .find((frame) => frame.url().indexOf("challenges") !== -1);
                        yield (frame === null || frame === void 0 ? void 0 : frame.click("input[type='checkbox']"));
                    }
                }
                catch (_) { }
            }
            yield this.page.waitForSelector("#__next", { timeout: 30000 });
        });
    }
    askQuestion(question) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return "error";
            console.info("[YC] Asking question '" + question + "'...");
            // Retreive answer from AI
            const url = env_1.YOUCHAT_API_URL.replace("{q}", encodeURIComponent(question)).replace("{h}", encodeURIComponent(
            // JSON.stringify(cleanHistory(history))
            "[]"));
            const data = yield this.page.evaluate((uri) => {
                return new Promise((resolve, reject) => {
                    let data = "";
                    const rejectTimer = setTimeout(() => reject(new Error("[YC -> askQuestion()] Request timeout")), 30000);
                    const es = new EventSource(uri);
                    es.addEventListener("token", (e) => {
                        try {
                            console.log(e.data);
                            data += JSON.parse(e.data).token;
                        }
                        catch (e) {
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
            if (!data)
                throw "Answer is empty";
            console.info("[YC] Answer: " + data);
            return data;
        });
    }
}
exports.default = YouChatScript;
