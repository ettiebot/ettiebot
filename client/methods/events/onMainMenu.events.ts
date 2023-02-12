import type { InquirerHistory } from "@inquirer/typings/Inquirer.typings";
import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { User } from "../../typings/User.typings";
import renderKeyboard from "../actions/renderKeyboard.actions";

export default async function onMainMenu(
	this: TelegramBotThis,
	btn: string | undefined,
	msg: TelegramBot.CallbackQuery,
	args: string[],
): Promise<void> {
	const chatId = Number(msg.message?.chat.id);
	const uid = `${chatId}.${msg.from?.id}`;
	const messageId = msg.message?.message_id;
	const user = ((await this.broker.cacher?.get(uid)) as User) ?? {};

	user.mainMenuStage = args.join(":");

	if (btn === "translate") {
		const changeState = args[0];
		if (changeState) {
			user.translatorEnabled = changeState !== "0";
		}

		await this.bot.editMessageText(i18next.t("mainMenu.translate", { lng: user.lang }), {
			message_id: messageId,
			chat_id: chatId,
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: i18next.t(
								user.translatorEnabled ? "basic.enabled" : "basic.disabled",
								{
									lng: user.lang,
								},
							),
							callback_data: `mainMenu:translate:${user.translatorEnabled ? 0 : 1}`,
						},
						{
							text: i18next.t("basic.backBtn", {
								lng: user.lang,
							}),
							callback_data: "mainMenu:back",
						},
					],
				],
			},
		});
	} else if (btn === "history") {
		const changeState = args[0];
		if (changeState && changeState !== "list") {
			user.historyEnabled = changeState !== "0";
			await this.broker.cacher?.set(`${uid}.h`, []);
		}

		const list = ((await this.broker.cacher?.get(`${uid}.h`)) ?? []) as InquirerHistory[];
		const listHumanized = list.map((item) => `- ${item.q.orig[0]}\n- ${item.a.norm[0]}\n`);

		const buttons = [
			{
				text: i18next.t(user.historyEnabled ? "basic.enabled" : "basic.disabled", {
					lng: user.lang,
				}),
				callback_data: `mainMenu:history:${user.historyEnabled ? 0 : 1}`,
			},
		];

		if (changeState !== "list") {
			buttons.push({
				text: i18next.t("mainMenu.historyListBtn", {
					lng: user.lang,
				}),
				callback_data: `mainMenu:history:list`,
			});
		}

		buttons.push({
			text: i18next.t("basic.backBtn", {
				lng: user.lang,
			}),
			callback_data: "mainMenu:back",
		});

		await this.bot.editMessageText(
			changeState === "list"
				? i18next.t(
						list.length > 0 ? "mainMenu.historyList" : "mainMenu.historyListEmpty",
						{
							lng: user.lang,
							replace: { list: listHumanized.join("\n") },
						},
				  )
				: i18next.t("mainMenu.history", { lng: user.lang }),
			{
				message_id: messageId,
				chat_id: chatId,
				reply_markup: {
					inline_keyboard: [buttons],
				},
			},
		);
	} else if (btn === "sub") {
		//
	} else if (btn === "back" || !btn) {
		await this.bot.editMessageText(
			i18next.t("basic.menuPlaceholder", {
				lng: user.lang,
				replace: { name: msg.from.first_name },
			}),
			{
				message_id: messageId,
				chat_id: chatId,
				reply_markup: {
					inline_keyboard: renderKeyboard(user, "mainMenu"),
				},
			},
		);
	}

	await this.broker.cacher?.set(uid, user);
}
