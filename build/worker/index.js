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
const browser_1 = require("./browser");
const network_1 = require("./network");
const worker_1 = __importDefault(require("./worker"));
const youChat_script_1 = __importDefault(require("./scripts/youChat.script"));
const network = new network_1.Network();
const browser = new browser_1.Browser();
setImmediate(() => __awaiter(void 0, void 0, void 0, function* () {
    // Start the browser
    const pBrowser = yield browser.start();
    const ycScript = new youChat_script_1.default(pBrowser);
    yield ycScript.init();
    const worker = new worker_1.default(network, ycScript);
    // Subscribe to request
    network.client.subscribeReq("ettie.io/ask", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield worker.onAsk(data);
        }
        catch (e) {
            console.error(e);
            return {
                question: {
                    question: data.question,
                    questionEN: data.question,
                    lang: "en",
                },
                answer: {
                    question: "An error occurred. Please try again later.",
                    questionEN: "An error occurred. Please try again later.",
                    lang: "en",
                },
            };
        }
    }));
    // Connect to the network
    yield network.start();
}));
