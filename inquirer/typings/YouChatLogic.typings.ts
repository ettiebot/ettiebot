export type LogicState = ["idle", "loaded", "error"];
export type YCApiURLQueryOpts = {
	q: string; // Query
	page?: number; // Page number
	count?: number; // Count of items per page
	safeSearch?: boolean; // Safe search
	onShoppingPage?: boolean; // On shopping page
	responseFilter?: string; // Response filter
	domain?: string; // Domain
	queryTraceId?: string; // Query trace id
	history?: string; // History
};
export type RunPayload = {
	q: string; // Query
	history: string; // History
};
export type YouChatAPIResponse = {
	text: string;
	search: Search[];
	externalSearch: ExternalSearch;
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
