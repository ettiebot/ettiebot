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
const bot_1 = __importDefault(require("./bot"));
const network_1 = require("./network");
const network = new network_1.Network();
const bot = new bot_1.default(network);
setImmediate(() => __awaiter(void 0, void 0, void 0, function* () {
    // Connect to the network
    yield network.start().then(() => bot.start());
    console.log("network start");
}));
process.on("uncaughtException", (e) => {
    bot.bot.telegram.sendMessage(bot.ownerChatId, "error\nname" + e.name + "\nmessage:" + e.message + "\nstack:" + e.stack);
    console.error(e);
});
