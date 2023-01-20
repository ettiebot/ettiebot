"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_PORT = exports.REDIS_HOST = exports.NETWORK_ID = exports.TELEGRAM_BOT_USERNAME = exports.TELEGRAM_BOT_TOKEN = void 0;
const parse_dotenv_1 = __importDefault(require("parse-dotenv"));
const env_var_1 = require("env-var");
process.env = (0, parse_dotenv_1.default)();
const env = (0, env_var_1.from)(process.env);
const TELEGRAM_BOT_TOKEN = env.get("TELEGRAM_BOT_TOKEN").required().asString();
exports.TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = env
    .get("TELEGRAM_BOT_USERNAME")
    .required()
    .asString();
exports.TELEGRAM_BOT_USERNAME = TELEGRAM_BOT_USERNAME;
const NETWORK_ID = env.get("NETWORK_ID").required().asString();
exports.NETWORK_ID = NETWORK_ID;
const REDIS_HOST = env.get("REDIS_HOST").default("localhost").asString();
exports.REDIS_HOST = REDIS_HOST;
const REDIS_PORT = env.get("REDIS_PORT").default(6379).asPortNumber();
exports.REDIS_PORT = REDIS_PORT;
