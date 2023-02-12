import type { InquirerActionResponse } from "@inquirer/typings/Inquirer.typings";
import i18next from "i18next";
import type TelegramBot from "node-telegram-bot-api";
import type { User } from "../../typings/User.typings";

export default function renderKeyboard(
	user: User,
	act: string,
	payload?: InquirerActionResponse,
): TelegramBot.InlineKeyboardButton[][] {
	if (act === "mainMenu") {
		return [
			[
				{
					text: i18next.t("mainMenu.translatorBtn", {
						lng: user.lang,
					}),
					callback_data: "mainMenu:translate",
				},
				{
					text: i18next.t("mainMenu.historyBtn", {
						lng: user.lang,
					}),
					callback_data: "mainMenu:history",
				},
				{
					text: i18next.t("mainMenu.langBtn", {
						lng: user.lang,
					}),
					callback_data: "changeLang",
				},
			],
			[
				{
					text: i18next.t("mainMenu.providerBtn", {
						lng: user.lang,
					}),
					callback_data: "mainMenu:provider",
				},
				{
					text: i18next.t("mainMenu.ttsBtn", {
						lng: user.lang,
					}),
					callback_data: "mainMenu:tts",
				},
				{
					text: i18next.t("mainMenu.delBtn", {
						lng: user.lang,
					}),
					callback_data: "deleteMsg",
				},
				// {
				// 	text: i18next.t("mainMenu.subBtn", {
				// 		lng: user.lang,
				// 	}),
				// 	callback_data: "mainMenu:sub",
				// },
			],
		];
	}
	if (act === "lang") {
		return [
			[
				{
					text: "🇺🇸 English",
					callback_data: "lang:en",
				},
				{
					text: "🏳️ Русский",
					callback_data: "lang:ru",
				},
				{
					text: "🇺🇦 Українська",
					callback_data: "lang:ua",
				},
			],
		];
	}
	if (act === "searchResults" && payload) {
		const btns = payload?.externalSearch.map((item) => ({
			text: item.name,
			url: item.url,
		}));
		return [
			btns,
			[
				{
					text: i18next.t("mainMenu.delBtn", {
						lng: user.lang,
					}),
					callback_data: "deleteMsg",
				},
			],
		];
	}
	if (act === "delBtn") {
		return [
			[
				{
					text: i18next.t("mainMenu.delBtn", {
						lng: user.lang,
					}),
					callback_data: "deleteMsg",
				},
			],
		];
	}

	return [];
}
