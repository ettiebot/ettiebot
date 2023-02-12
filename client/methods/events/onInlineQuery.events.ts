import i18next from "i18next";
import type { InlineQueryResultArticle } from "node-telegram-bot-api";
import type TelegramBot from "node-telegram-bot-api";
import type { ClientError } from "../../errors";
import { errorToText } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import clearMessageText from "../../utils/clearMessageText.utils";
import { doRateLimiter } from "../actions";
import onInquirerJob from "./onInquirerJob.events";

export default async function onInlineQuery(
	this: TelegramBotThis,
	msg: TelegramBot.InlineQuery,
): Promise<void> {
	const uid = `${msg.from?.id}.${msg.from?.id}`;
	const user = (await this.broker.cacher?.get(uid)) as User;

	const text = clearMessageText(msg.query);
	if (!text || text.length < 10) {
		return;
	}

	if (!user) {
		await this.bot.answerInlineQuery(msg.id, [
			{
				type: "article",
				id: "1",
				title: i18next.t("errors.setUpNeed", {
					lng: msg.from?.language_code ?? "en",
				}),
				input_message_content: {
					message_text: ":(",
				},
			},
		]);
	} else {
		// Check rate limit
		const rateSuccess = await doRateLimiter
			.bind(this)(msg.from?.id)
			.then(() => true)
			.catch(async (error: ClientError) => {
				const errorText = errorToText(error, msg.from?.language_code ?? "en");
				await this.bot.answerInlineQuery(msg.id, [
					{
						type: "article",
						id: "1",
						title: errorText,
						input_message_content: {
							message_text: errorText,
						},
					},
				]);
				return false;
			});

		if (!rateSuccess) {
			return;
		}

		// Set rate limit
		await this.broker.cacher?.set(`${msg.from?.id}:l`, true, 10);

		const send = (data: InlineQueryResultArticle[]) => this.bot.answerInlineQuery(msg.id, data);

		await this.inquirer
			.add(() => onInquirerJob.bind(this)({ text, uid }))
			.then((result) => {
				const results: InlineQueryResultArticle[] = [
					{
						type: "article",
						id: "air",
						title: i18next.t("inline.sendResult", {
							lng: msg.from?.language_code ?? "en",
						}),
						description: result.text,
						input_message_content: {
							message_text: result.text,
						},
					},
					...result.externalSearch.map(
						(search, i): InlineQueryResultArticle => ({
							type: "article",
							id: `sr${i}`,
							title: i18next.t("inline.sendSearch", {
								lng: msg.from?.language_code ?? "en",
							}),
							description: `${search.name} - ${search.url}`,
							input_message_content: {
								message_text: `${search.name} - ${search.url}`,
							},
						}),
					),
				];
				return send(results);
			})
			.catch((error) => {
				this.logger.error("JOB FAILURE", error);
				return send([]);
			});
	}
}
