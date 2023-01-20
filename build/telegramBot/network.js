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
exports.Network = void 0;
const translink_1 = __importDefault(require("@coryfoundation/translink"));
const thread_promises_1 = __importDefault(require("thread-promises"));
const events_1 = __importDefault(require("events"));
const env_1 = require("./env");
class Network extends events_1.default {
    constructor() {
        super(...arguments);
        this.client = new translink_1.default({
            namespace: env_1.NETWORK_ID,
            waitForPeer: true,
            requestTimeout: 180000,
            log: true,
        });
    }
    /**
     * Initialize network class
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
            console.info("Network has been started");
        });
    }
    ask(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new thread_promises_1.default((resolve, reject) => this.client.get("ettie.io/ask", data).then(resolve).catch(reject));
        });
    }
}
exports.Network = Network;
