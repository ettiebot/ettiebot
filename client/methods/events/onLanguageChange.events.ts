import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { UserLanguage } from "../../typings/Language.typings";
import type { User } from "../../typings/User.typings";
import renderKeyboard from "../actions/renderKeyboard.actions";

export default async function onChangeLanguage(
	this: TelegramBotThis,
	lang: string,
	msg: TelegramBot.CallbackQuery,
): Promise<void> {
	const chatId = Number(msg.message?.chat.id);
	const uid = `${chatId}.${msg.from?.id}`;
	const user = ((await this.broker.cacher?.get(uid)) as User) ?? {};

	user.lang = lang as UserLanguage;
	user.translatorEnabled = true;
	user.historyEnabled = true;

	await this.bot.editMessageText(i18next.t("languageChanged", { lng: user.lang }), {
		message_id: msg.message?.message_id,
		chat_id: `${chatId}`,
		reply_markup: { inline_keyboard: [] },
	});

	await this.bot.sendMessage(
		chatId,
		i18next.t("welcome.text", {
			lng: user.lang,
			replace: { name: msg.from.first_name },
		}),
		{
			reply_markup: {
				inline_keyboard: renderKeyboard(user, "mainMenu"),
			},
		},
	);

	await this.broker.cacher?.set(uid, user);
}
