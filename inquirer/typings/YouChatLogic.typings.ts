import type { WeatherAppRoot } from "../logic/apps/weatherApp.apps";
import type { WikipediaAppRoot } from "../logic/apps/wikipediaApp.apps";

export type LogicState = ["idle", "loaded", "error"];
export type YCApiURLQueryOpts = {
	q: string; // Query
	page?: number; // Page number
	count?: number; // Count of items per page
	safeSearch?: string; // Safe search
	onShoppingPage?: boolean; // On shopping page
	mkt?: string;
	responseFilter?: string; // Response filter
	domain?: string; // Domain
	queryTraceId?: string; // Query trace id
	history?: string; // History
	chatId?: string; // Chat id
};
export type RunPayload = {
	q: string; // Query
	history: string; // History
	chatId: string; // Chat id
};
export type YouChatAPIResponse = {
	slots: SlotDictionary[];
	text: string;
	search: Search[];
	externalSearch: ExternalSearch;
	appData: (WeatherAppRoot | WikipediaAppRoot)[];
};

export interface Welcome1 {
	text: string;
	search: Search[];
	externalSearch: ExternalSearch;
}

export interface ExternalSearch {
	third_party_search_results: ThirdPartySearchResult[];
	rankings: Rankings;
	query_context: QueryContext;
	third_party_web_results_source: number;
}

export interface QueryContext {
	spelling: null;
	originalQuery: string;
}

export interface Rankings {
	pole: null;
	sidebar: null;
	mainline: Mainline[];
}

export interface Mainline {
	answerType: string;
	resultIndex: number;
	value: Value;
}

export interface Value {
	id: string;
}

export interface ThirdPartySearchResult {
	name: string;
	url: string;
	displayUrl: string;
	snippet: string;
	language: null;
	thumbnailUrl: string;
	isFamilyFriendly: null;
	isNavigational: null;
}

export interface Search {
	url: string;
	name: string;
	snippet: string;
}

export interface Welcome9 {
	slot_dictionary: SlotDictionary;
}

export interface SlotDictionary {
	UNK: void;
	adultcontent: Adultcontent;
	code: Code;
	colorpicker: Colorpicker;
	computation: Computation;
	creativity: Computation;
	crypto: Crypto;
	dictionary: Dictionary;
	directions: Directions;
	entertainment: Entertainment;
	finance: Finance;
	home: Computation;
	information: Computation;
	media: Media;
	music: Music;
	news: Computation;
	onlinelearning: Computation;
	packagetracking: Packagetracking;
	places: Places;
	reading: Reading;
	recipes: Computation;
	shopping: Computation;
	social: Social;
	sports: Sports;
	translation: Translation;
	tutorial: Computation;
	weather: Weather;
	youeat: Computation;
	youwrite: Youwrite;
}

export interface Adultcontent {
	sexualCategory: string;
}
export interface Code {
	codeLanguage: string;
}

export interface Colorpicker {
	hex: string;
}

export interface Computation {
	appTrigger: string;
}

export interface Crypto {
	cryptocurrency: string;
}

export interface Dictionary {
	word: string;
}

export interface Directions {
	toLocation: string;
}

export interface Entertainment {
	content: string;
}

export interface Finance {
	assetName: string;
}

export interface Media {
	mediaSubject: string;
}

export interface Music {
	artist: string;
}

export interface Packagetracking {
	fedex: string;
}

export interface Places {
	placeLocation: string;
}

export interface Reading {
	author: string;
}

export interface Social {
	mainText: string;
}

export interface Sports {
	sportsTeam: string;
}

export interface Translation {
	sourceLanguage: string;
}

export interface Weather {
	weatherLocation: string;
}

export interface Youwrite {
	audience: string;
}
