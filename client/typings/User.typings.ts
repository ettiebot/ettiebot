import type { UserLanguage } from "./Language.typings";

export interface User {
	lang: UserLanguage;
	welcomeStage?: number;
	mainMenuStage?: string;
	translatorEnabled: boolean;
	historyEnabled: boolean;
}

export const languages = ["en", "ru"] as const;
