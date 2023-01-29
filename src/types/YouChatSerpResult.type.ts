export type YouChatSerpResult = {
  url: string;
  name: string;
  snippet: string;
};

export interface Welcome7 {
  search: Search;
  time: number;
  query: string;
  exactAbTestSlices: ExactAbTestSlices;
}

export interface ExactAbTestSlices {}

export interface Search {
  third_party_search_results: ThirdPartySearchResult[];
  rankings: Rankings;
  query_context: QueryContext;
  third_party_web_results_source: number;
  third_party_top_ranked_apps: any[];
  third_party_ranked_apps: string[];
  third_party_meta_ranking_info: ThirdPartyMetaRankingInfo;
  fact_checker_results: ExactAbTestSlices;
  heuristic_version: string;
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
  answerType: AnswerType;
  resultIndex: number;
  value: Value;
}

export enum AnswerType {
  WebPages = "WebPages",
}

export interface Value {
  id: string;
}

export interface ThirdPartyMetaRankingInfo {
  abRemoveBadUrls_v2: string;
  isNavigational: null;
  isInformational: boolean;
  factCheckerData: ExactAbTestSlices;
}

export interface ThirdPartySearchResult {
  name: string;
  url: string;
  displayUrl: string;
  snippet: string;
  language: null;
  thumbnailUrl: null | string;
  isFamilyFriendly: null;
  isNavigational: null;
}
