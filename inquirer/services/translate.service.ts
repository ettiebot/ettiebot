import type { Context, Service, ServiceSchema } from "moleculer";
import { YandexTranslator } from "../translator/translators/YandexTranslator";
import type { UserLanguage } from "../typings/Language.typings";
import { YandexLanguageEnum } from "../typings/Language.typings";
import type { TranslateResponse } from "../typings/Translate.typings";

export interface ActionExecuteParams {
	text: string;
	to: string;
	from: string;
}

interface TranslateLocalVars {
	yandex: YandexTranslator;
}

type TranslateThis = Service<void> & TranslateLocalVars;

const TranslateService: ServiceSchema<void> = {
	name: "Translate",

	/**
	 * Actions
	 */
	actions: {
		execute: {
			params: {
				text: "string",
				from: {
					type: "string",
					default: "auto",
				},
				to: {
					type: "string",
					default: "en",
				},
			},
			async handler(
				this: TranslateThis,
				ctx: Context<ActionExecuteParams>,
			): Promise<TranslateResponse> {
				const { text, from, to } = await this.yandex.translate(
					ctx.params.text,
					YandexLanguageEnum[ctx.params.from as UserLanguage],
					YandexLanguageEnum[ctx.params.to as UserLanguage],
				);
				return { text, from, to };
			},
		},
	},

	created(this: TranslateThis) {
		this.yandex = new YandexTranslator();
	},
	async started(this: TranslateThis) {},
	async stopped(this: TranslateThis) {},
};

export default TranslateService;
