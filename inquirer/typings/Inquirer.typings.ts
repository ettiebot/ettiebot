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
	lang?: string;
}
