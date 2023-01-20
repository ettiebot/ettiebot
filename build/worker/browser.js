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
exports.Browser = void 0;
const appdata_path_1 = __importDefault(require("appdata-path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
class Browser {
    /**
     * Starts the browser
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch({
                headless: false,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--user-data-dir=" + (0, appdata_path_1.default)("ettie"),
                ],
            });
            console.info("Browser has been started");
            return this.browser;
        });
    }
}
exports.Browser = Browser;
