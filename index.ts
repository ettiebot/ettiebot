import dotenv from "dotenv";
import { TelegramBot } from "./bots/telegram";

process.setMaxListeners(0);

dotenv.config();
new TelegramBot(String(process.env.TELEGRAM_BOT_TOKEN));
