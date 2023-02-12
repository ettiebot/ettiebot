import type { InquirerActionResponse } from "@inquirer/typings/Inquirer.typings";
import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import { ClientError, errorToText } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import clearAnswerText from "../../utils/clearAnswerText.utils";
import clearMessageText from "../../utils/clearMessageText.utils";
import { checkMention, doRateLimiter } from "../actions";
import renderKeyboard from "../actions/renderKeyboard.actions";
import onInquirerJob from "./onInquirerJob.events";
import onChangeLanguage from "./onLanguageChange.events";

export default async function onTextMessage(
	this: TelegramBotThis,
	msg: TelegramBot.Message,
): Promise<void> {
	// Check if message is mentioned
	const mentionPredict = checkMention(msg.text);
	const mentioned = mentionPredict && mentionPredict.length > 0;
	if (msg.chat.id < 0 && !mentioned) {
		return;
	}

	const uid = `${msg.chat.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	this.logger.info(uid, user);

	if (user && msg.text && msg.text[0] !== "/") {
		// Check rate limit
		await doRateLimiter
			.bind(this)(msg.from?.id)
			.catch((e: ClientError) => {
				void this.bot.sendMessage(msg.chat.id, errorToText(e, user.lang), {
					reply_to_message_id: msg.message_id,
				});
			});

		const text = clearMessageText(`${msg.text}`);
		// Check what message have a text
		if (text.length < 3 || text.length > 150) {
			void this.bot.sendMessage(
				msg.chat.id,
				errorToText(new ClientError("TEXT_TOO_SMALL_OR_TOO_LONG"), user.lang),
				{
					reply_to_message_id: msg.message_id,
				},
			);
			return;
		}

		const message = await this.bot.sendMessage(
			msg.chat.id,
			i18next.t("basic.processing", { lng: user.lang }),
			{
				reply_to_message_id: msg.message_id,
			},
		);

		const send = (result: InquirerActionResponse) =>
			this.bot.editMessageText(clearAnswerText(result.text), {
				message_id: message.message_id,
				chat_id: `${msg.chat.id}`,
				reply_markup: {
					inline_keyboard: renderKeyboard(user, "searchResults", result),
				},
			});

		await this.inquirer
			.add(() => onInquirerJob.bind(this)({ text, uid }))
			.then(send)
			.catch(() =>
				send({
					text: i18next.t("errors.unknown", { lng: user.lang }),
					search: [],
					externalSearch: [],
				}),
			);
	} else if (!user && (mentioned || msg.chat.id > 0)) {
		await onChangeLanguage.bind(this)(
			String(msg.from?.language_code) ?? "en",
			msg.chat,
			msg.from,
			undefined,
			msg.message_id,
		);
	}
}
