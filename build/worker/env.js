"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YOUCHAT_API_URL = exports.NETWORK_ID = void 0;
const parse_dotenv_1 = __importDefault(require("parse-dotenv"));
const env_var_1 = require("env-var");
const env = (0, env_var_1.from)((0, parse_dotenv_1.default)());
const NETWORK_ID = env.get("NETWORK_ID").required().asString();
exports.NETWORK_ID = NETWORK_ID;
const YOUCHAT_API_URL = env
    .get("YOUCHAT_API_URL")
    .default("https://you.com/api/youchatStreaming?question={q}&chat={h}")
    .asUrlString();
exports.YOUCHAT_API_URL = YOUCHAT_API_URL;
