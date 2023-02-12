import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import renderKeyboard from "../actions/renderKeyboard.actions";

export default async function onMainMenuBtn(
	this: TelegramBotThis,
	msg: TelegramBot.Message,
): Promise<void> {
	const chatId = msg.chat.id;
	const uid = `${msg.chat.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	if (user) {
		await this.bot.sendMessage(
			chatId,
			i18next.t("welcome.text", {
				lng: user.lang,
				replace: { name: msg.from?.first_name },
			}),
			{
				reply_to_message_id: msg.message_id,
				reply_markup: {
					inline_keyboard: renderKeyboard(user, "mainMenu"),
				},
			},
		);
	}
}
