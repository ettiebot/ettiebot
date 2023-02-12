import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import onChangeLanguage from "./onLanguageChange.events";

export default async function onChatStart(
	this: TelegramBotThis,
	msg: TelegramBot.Message,
): Promise<void> {
	const uid = `${msg.chat.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	if (!user) {
		await onChangeLanguage.bind(this)(
			String(msg.from?.language_code) ?? "en",
			msg.chat,
			msg.from,
		);
	}
}
