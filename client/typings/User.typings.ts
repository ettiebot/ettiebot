import type { UserLanguage } from "./Language.typings";

export type UserProviders = "al" | "yc";
export enum ProvidersName {
	"al" = "Alice",
	"yc" = "YouChat",
}
export interface User {
	lang: UserLanguage;
	welcomeStage?: number;
	mainMenuStage?: string;
	translatorEnabled: boolean;
	historyEnabled: boolean;
	ttsEnabled: boolean;
	onlyTTS: boolean;
	provider: UserProviders;
	ycId?: string;
}

export const languages = ["en", "ru", "ua"] as const;
