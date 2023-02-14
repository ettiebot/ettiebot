import type {
	InquirerActionAliceResponse,
	InquirerActionResponse,
} from "@inquirer/typings/Inquirer.typings";
import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { IAliceActiveRequest } from "ya-alice-client/src/types";
import { ClientError, errorToText } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { InquirerExecuteTTSPayload } from "../../typings/Inquirer.typings";
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

	const chatId = msg.chat.id;
	const messageId = msg.message_id;
	const uid = `${msg.chat.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	this.logger.info(uid, user);

	if (user && msg.text && msg.text[0] !== "/") {
		// Check rate limit
		const rateSuccess = await doRateLimiter
			.bind(this)(msg.from?.id)
			.then(() => true)
			.catch((e: ClientError) => {
				void this.bot.sendMessage(msg.chat.id, errorToText(e, user.lang), {
					reply_to_message_id: msg.message_id,
				});
				return false;
			});

		if (!rateSuccess) {
			return;
		}

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

		const send = async (
			result: InquirerActionResponse | InquirerActionAliceResponse,
			isYC = true,
		) => {
			if (isYC) {
				const res = result as InquirerActionResponse;
				await this.bot.editMessageText(clearAnswerText(result.text), {
					message_id: message.message_id,
					chat_id: chatId,
					reply_markup: {
						inline_keyboard: isYC ? renderKeyboard(user, "searchResults", res) : [],
					},
				});
			} else {
				await this.bot.editMessageText(clearAnswerText(result.text), {
					message_id: message.message_id,
					chat_id: chatId,
					reply_markup: {
						inline_keyboard: renderKeyboard(user, "delBtn"),
					},
				});
			}
		};

		const sendVoice = async (
			result: InquirerActionResponse | InquirerActionAliceResponse,
			isYC = true,
		) => {
			try {
				if (isYC) {
					const { audioData } = await this.broker.call<
						IAliceActiveRequest,
						InquirerExecuteTTSPayload
					>("Inquirer.executeTTS", {
						q: clearAnswerText(result.text),
					});
					if (!audioData) {
						this.logger.info("voice is empty", audioData);
						return;
					}

					await this.bot.sendVoice(chatId, audioData, {
						reply_to_message_id: messageId,
						reply_markup: {
							inline_keyboard: renderKeyboard(
								user,
								"searchResults",
								result as InquirerActionResponse,
							),
						},
					});
				} else {
					const voiceFile = (result as InquirerActionAliceResponse).audio;
					if (!voiceFile) {
						return;
					}

					await this.bot.sendVoice(chatId, voiceFile, {
						reply_to_message_id: messageId,
						reply_markup: {
							inline_keyboard: renderKeyboard(user, "delBtn"),
						},
					});
				}
			} catch (error) {
				this.logger.error(error);
				throw new ClientError("VOICE_ERROR");
			}
		};

		await this.inquirer
			.add(() =>
				onInquirerJob.bind(this)({
					text,
					uid,
					provider: user.provider,
					tts: user.ttsEnabled,
				}),
			)
			.then(async (result) => {
				this.logger.info("[onTextMessage] Inquirer response", result);
				const aliceResult = result as InquirerActionAliceResponse;
				if (!user.ttsEnabled || !user.onlyTTS) {
					await send(result, user.provider === "yc");
				}
				if (user.ttsEnabled) {
					await sendVoice(aliceResult.audio ? aliceResult : result, !aliceResult.audio);
					if (user.onlyTTS) {
						await this.bot.deleteMessage(chatId, `${message.message_id}`);
					}
				}
			})
			.catch((error) => {
				if (error.code === "VOICE_ERROR" || error.code === "TTS_ERROR") {
					void this.bot.sendMessage(chatId, i18next.t("errors.tts", { lng: user.lang }), {
						reply_to_message_id: msg.message_id,
					});
					void this.bot.deleteMessage(chatId, `${message.message_id}`);
				} else {
					this.logger.error(error);
					return send({
						text: i18next.t("errors.unknown", { lng: user.lang }),
						search: [],
						externalSearch: [],
					});
				}

				return null;
			});
	} else if (!user && (mentioned || msg.chat.id > 0) && msg.text?.[0] !== "/") {
		await onChangeLanguage.bind(this)(
			String(msg.from?.language_code) ?? "en",
			msg.chat,
			msg.from,
			undefined,
			msg.message_id,
		);
	}
}
