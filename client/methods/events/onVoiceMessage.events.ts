import type {
	InquirerActionAliceResponse,
	InquirerActionResponse,
} from "@inquirer/typings/Inquirer.typings";
import axios from "axios";
import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { IAliceActiveRequest } from "ya-alice-client/src/types";
import { ClientError, errorToText } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { InquirerExecuteTTSPayload } from "../../typings/Inquirer.typings";
import { LanguageEnum } from "../../typings/Language.typings";
import type { User } from "../../typings/User.typings";
import clearAnswerText from "../../utils/clearAnswerText.utils";
import clearMessageText from "../../utils/clearMessageText.utils";
import { doRateLimiter } from "../actions";
import renderKeyboard from "../actions/renderKeyboard.actions";
import onInquirerJob from "./onInquirerJob.events";

export default async function onVoiceMessage(
	this: TelegramBotThis,
	msg: TelegramBot.Message,
): Promise<void> {
	const {
		voice,
		message_id: messageId,
		reply_to_message: reply,
		chat: { id: chatId },
	} = msg;
	const uid = `${chatId}.${msg.from?.id}`;
	const user = ((await this.broker.cacher?.get(uid)) as User) ?? {};

	if (user && voice) {
		// Check if reply to bot message (in group chat)
		// or check what is not a private chat
		if (
			(reply && reply.from?.username !== process.env.TELEGRAM_BOT_USERNAME) ||
			(!reply && chatId < 0)
		) {
			return;
		}

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

		// Send message
		const message = await this.bot.sendMessage(
			chatId,
			i18next.t("basic.processing", { lng: user.lang }),
			{
				reply_to_message_id: messageId,
			},
		);

		try {
			// Get voice file link
			const fileUrl = await this.bot.getFileLink(voice.file_id);

			const { data: voiceBuffer } = await axios.get<Buffer>(fileUrl, {
				responseType: "arraybuffer",
			});

			// Create a reference to a file object
			const file = this.gcStorage.bucket("ettie").file(`${uid}.oga`);
			// Upload file
			await file.save(voiceBuffer);

			// Speech to text
			const [response] = await this.gcSpeech.recognize({
				audio: {
					uri: `gs://ettie/${uid}.oga`,
				},
				config: {
					encoding: 6,
					sampleRateHertz: 48000,
					languageCode: LanguageEnum[user.lang],
				},
			});

			// Delete file
			await file.delete();

			// Check what response have a results
			if (!response.results) {
				void this.bot.editMessageText(
					errorToText(new ClientError("VOICE_PREDICT_ERROR"), user.lang),
					{
						message_id: message.message_id,
						chat_id: chatId,
					},
				);
				return;
			}

			const text = clearMessageText(
				response.results.map((result) => result.alternatives?.[0].transcript).join("\n"),
			);

			// Check what message have a text
			if (!text || text.length > 150) {
				void this.bot.editMessageText(
					errorToText(new ClientError("VOICE_IS_EMPTY_OR_TOO_LONG"), user.lang),
					{
						message_id: message.message_id,
						chat_id: chatId,
					},
				);
				return;
			}

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
				if (isYC) {
					const { audio } = await this.broker.call<
						InquirerActionAliceResponse,
						InquirerExecuteTTSPayload
					>("Inquirer.executeTTS", {
						q: clearAnswerText(result.text),
					});
					if (!audio) {
						this.logger.info("voice is empty", audio);
						return;
					}

					await this.bot.sendVoice(chatId, audio, {
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
					this.logger.info("[onVoiceMessage] Inquirer response", result);
					const aliceResult = result as InquirerActionAliceResponse;
					if (!user.ttsEnabled || !user.onlyTTS) {
						await send(result, user.provider === "yc");
					}
					if (user.ttsEnabled) {
						await sendVoice(
							aliceResult.audio ? aliceResult : result,
							!aliceResult.audio,
						);
						if (user.onlyTTS) {
							await this.bot.deleteMessage(chatId, `${message.message_id}`);
						}
					}
				})
				.catch((error) => {
					if (error.code === "VOICE_ERROR" || error.code === "TTS_ERROR") {
						void this.bot.sendMessage(
							chatId,
							i18next.t("errors.tts", { lng: user.lang }),
							{
								reply_to_message_id: msg.message_id,
							},
						);
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
		} catch (error) {
			this.logger.error("[onVoiceMessage] catch", error);
			void this.bot.editMessageText(i18next.t("errors.unknown"), {
				message_id: message.message_id,
				chat_id: chatId,
			});
		}
	}
}
