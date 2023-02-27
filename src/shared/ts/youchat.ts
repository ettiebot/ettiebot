import z from 'zod';
import { WeatherAppDatum } from './youchat/weather.js';
import { WikipediaAppDatum } from './youchat/wikipedia.js';

export interface YouChatResponse {
  '0': string;
  '1': string;
  intents: string[];
  slot_dictionary: SlotDictionary;
  search: Search;
  time: number;
  query: string;
  exactAbTestSlices: ExactAbTestSlices;
  ydcAppName: string;
  data: (WikipediaAppDatum | WeatherAppDatum)[];
  isFinal: boolean;
  timedOut: boolean;
  latency: number;
  mainline_ranked_apps: string[];
  sideline_ranked_apps: any[];
  has_intent: boolean;
  meta_ranking_info: MetaRankingInfo;
  youChatSerpResults: YouChatSerpResult[];
  text: string;
}

export interface ExactAbTestSlices {
  abReduceNumApps: string;
  abUseQueryRewriter: string;
  abUseAppsForYouChat: string;
  abReduceAppSearchTimeout: string;
}

export interface MetaRankingInfo {
  und: any;
}

export interface Search {
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
  answerType: AnswerType;
  resultIndex: number;
  value: Value;
}

export enum AnswerType {
  WebPages = 'WebPages',
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
  thumbnailUrl: null | string;
  isFamilyFriendly: null;
  isNavigational: null;
}

export interface SlotDictionary {
  UNK: Unk;
  adultcontent: Adultcontent;
  code: Code;
  colorpicker: Colorpicker;
  computation: Computation;
  creativity: Creativity;
  crypto: Crypto;
  dictionary: Dictionary;
  directions: Directions;
  entertainment: Entertainment;
  finance: Finance;
  home: Home;
  information: Information;
  media: Media;
  music: Music;
  news: News;
  onlinelearning: Onlinelearning;
  packagetracking: Packagetracking;
  places: Places;
  reading: Reading;
  recipes: Recipes;
  shopping: Shopping;
  social: Social;
  sports: Sports;
  translation: Translation;
  tutorial: Tutorial;
  weather: Weather;
  youeat: Youeat;
  youwrite: Youwrite;
}

export interface Unk {
  UNK: string;
}

export interface Adultcontent {
  sexualCategory: string;
}

export interface Code {
  csConcept: string;
}

export interface Colorpicker {
  rgb: string;
  appTrigger: string;
}

export interface Computation {
  appTrigger: string;
}

export interface Creativity {
  art: string;
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

export interface Home {
  product: string;
}

export interface Information {
  query: string;
}

export interface Media {
  modifier: string;
  mediaSubject: string;
}

export interface Music {
  artist: string;
}

export interface News {
  PAD: string;
  newsQuery: string;
}

export interface Onlinelearning {
  learningSearchQuery: string;
}

export interface Packagetracking {
  fedex: string;
  appTrigger: string;
}

export interface Places {
  placeLocation: string;
}

export interface Reading {
  title: string;
  author: string;
}

export interface Recipes {
  recipeName: string;
}

export interface Shopping {
  brand: string;
}

export interface Social {
  accountName: string;
}

export interface Sports {
  sportsTeamQuery: string;
  sportsQuery: string;
}

export interface Translation {
  sourceText: string;
}

export interface Tutorial {
  tutorialQuery: string;
}

export interface Weather {
  weatherLocation: string;
}

export interface Youeat {
  restaurant: string;
}

export interface Youwrite {
  audience: string;
}

export interface YouChatSerpResult {
  url: string;
  name: string;
  snippet: string;
}

export const youChatHistory = z
  .object({
    question: z.string(),
    answer: z.string(),
  })
  .array();
