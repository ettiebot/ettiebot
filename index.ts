import dotenv from "dotenv";
import { TelegramBot } from "./bots/telegram";

dotenv.config();
const bot = new TelegramBot(String(process.env.TELEGRAM_BOT_TOKEN));
console.info("Bot has been started");
