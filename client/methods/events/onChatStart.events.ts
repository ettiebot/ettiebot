import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import renderKeyboard from "../actions/renderKeyboard.actions";

export default async function onChatStart(
	this: TelegramBotThis,
	msg: TelegramBot.Message,
): Promise<void> {
	const chatId = msg.chat.id;
	const uid = `${msg.chat.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	if (!user) {
		await this.bot.sendMessage(chatId, "Choose language", {
			reply_markup: {
				inline_keyboard: renderKeyboard(user, "lang"),
			},
		});
	}
}
