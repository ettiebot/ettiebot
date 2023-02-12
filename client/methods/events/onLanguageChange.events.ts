import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { UserLanguage } from "../../typings/Language.typings";
import type { User } from "../../typings/User.typings";
import renderKeyboard from "../actions/renderKeyboard.actions";

export default async function onChangeLanguage(
	this: TelegramBotThis,
	lang: string,
	chat: TelegramBot.Chat | undefined,
	from: TelegramBot.User | undefined,
	messageId?: number | undefined,
	replyId?: number | undefined,
): Promise<void> {
	const chatId = Number(chat?.id);
	const uid = `${chatId}.${from?.id}`;
	const user = ((await this.broker.cacher?.get(uid)) as User) ?? {};

	user.lang = lang as UserLanguage;

	if (Object.keys(user).length === 0 || !user || !user.provider) {
		user.translatorEnabled = true;
		user.historyEnabled = true;
		user.ttsEnabled = false;
		user.onlyTTS = false;
		user.provider = "yc";
	}

	// await this.bot.editMessageText(i18next.t("languageChanged", { lng: user.lang }), {
	// 	message_id: msg.message?.message_id,
	// 	chat_id: `${chatId}`,
	// 	reply_markup: { inline_keyboard: [] },
	// });

	if (messageId) {
		await this.bot.editMessageText(
			i18next.t("welcome.text", {
				lng: user.lang,
				replace: { name: from?.first_name },
			}),
			{
				chat_id: chatId,
				message_id: messageId,
				reply_markup: {
					inline_keyboard: renderKeyboard(user, "mainMenu"),
				},
			},
		);
	} else {
		await this.bot.sendMessage(
			chatId,
			i18next.t("welcome.text", {
				lng: user.lang,
				replace: { name: from?.first_name },
			}),
			{
				reply_to_message_id: replyId,
				reply_markup: {
					inline_keyboard: renderKeyboard(user, "mainMenu"),
				},
			},
		);
	}

	await this.broker.cacher?.set(uid, user);
}
