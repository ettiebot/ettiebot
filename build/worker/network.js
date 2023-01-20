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
const env_1 = require("./env");
class Network {
    constructor() {
        this.client = new translink_1.default({
            namespace: env_1.NETWORK_ID,
            waitForPeer: false,
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
}
exports.Network = Network;
