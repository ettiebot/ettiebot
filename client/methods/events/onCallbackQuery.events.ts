import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import { renderKeyboard } from "../actions";
import onChangeLanguage from "./onLanguageChange.events";
import onMainMenu from "./onMainMenu.events";

export default async function onCallbackQuery(
	this: TelegramBotThis,
	msg: TelegramBot.CallbackQuery,
): Promise<void> {
	const chatId = Number(msg.message?.chat.id);
	const uid = `${msg.message?.chat.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	if (
		!msg.data ||
		(msg.message?.from?.username !== process.env.TELEGRAM_BOT_USERNAME &&
			msg.from.id !== msg.message?.from?.id)
	) {
		return;
	}

	const [cmd, payload, ...args] = msg.data.split(":");

	if (cmd === "lang") {
		await onChangeLanguage.bind(this)(payload, msg);
	} else if (cmd === "changeLang" && user) {
		await this.bot.editMessageText("Choose language", {
			message_id: msg.message?.message_id,
			chat_id: chatId,
			reply_markup: {
				inline_keyboard: renderKeyboard(user, "lang"),
			},
		});
	} else if (cmd === "mainMenu" && user) {
		await onMainMenu.bind(this)(payload, msg, args);
	}
}