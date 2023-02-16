import type { IAliceActiveRequest } from "ya-alice-client";
import type { UserLanguage } from "./Language.typings";
import type { Search, ThirdPartySearchResult } from "./YouChatLogic.typings";

export interface InquirerHistory {
	q: {
		orig: [string, string];
		norm: [string, string];
	};
	a: {
		orig: [string, string];
		norm: [string, string];
	};
}

export interface InquirerActionResponse {
	text: string;
	search: Search[];
	externalSearch: ThirdPartySearchResult[];
}

export interface InquirerActionAliceResponse {
	text: string;
	audio: Buffer | undefined;
	aliceData?: IAliceActiveRequest;
}

export interface InquirerActionAliceExecuteParams {
	q: string;
	uid: string;
	tts: boolean;
	lang: string;
}

export interface InquirerActionExecuteParams {
	q: string;
	needTranslate: boolean;
	uid: string;
	lang: UserLanguage;
	chatId: string;
}
//
