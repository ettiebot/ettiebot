/* eslint-disable @typescript-eslint/naming-convention */
export interface ApiResDirectiveRoot {
	directive: ApiResDirective;
}

export interface ApiResDirective {
	payload: PurplePayload;
	header: DirectiveHeader;
}

export interface DirectiveHeader {
	name: string;
	refMessageId: string;
	messageId: string;
	namespace: Namespace;
	streamId: number;
}

export enum Namespace {
	Vins = "Vins",
}

export interface PurplePayload {
	version: string;
	header: PayloadHeader;
	response: Response;
	voice_response: VoiceResponse;
	counteractivation_features: CounteractivationFeatures;
	from_cache: boolean;
	lazy_tts_streaming: boolean;
	enable_bargin: boolean;
	disableInterruptionSpotter: boolean;
	format: string;
}

export interface CounteractivationFeatures {
	has_directive: boolean;
}

export interface PayloadHeader {
	response_id: string;
	request_id: string;
	ref_message_id: string;
	session_id: string;
	dialog_id: null;
}

export interface Response {
	cards: Card[];
	card: Card;
	quality_storage: QualityStorage;
	suggest: Suggest;
	experiments: void;
	directives_execution_policy: string;
	directives: any[];
}

export interface Card {
	type: string;
	text: string;
}

export interface QualityStorage {
	post_win_reason: string;
	scenarios_information: { [key: string]: ScenariosInformation };
	pre_predicts: PrePredicts;
	post_predicts: PostPredicts;
}

export interface PostPredicts {
	GeneralConversation: number;
	Video: number;
	Vins: number;
	SideSpeech: number;
	Search: number;
	HollywoodMusic: number;
}

export interface PrePredicts {
	Alarm: number;
	SideSpeech: number;
	SkillDiscoveryGc: number;
	HardcodedResponse: number;
	Video: number;
	HollywoodMusic: number;
	Vins: number;
	GeneralConversation: number;
	Search: number;
}

export interface ScenariosInformation {
	reason: string;
	classification_stage: ClassificationStage;
}

export enum ClassificationStage {
	EcsPost = "ECS_POST",
	EcsPre = "ECS_PRE",
}

export interface Suggest {
	items: Item[];
}

export interface Item {
	type: ItemType;
	title: string;
	directives: ItemDirective[];
}

export interface ItemDirective {
	name: Name;
	payload: FluffyPayload;
	type: DirectiveType;
	sub_name?: SubName;
	ignore_answer?: boolean;
	is_led_silent?: boolean;
}

export enum Name {
	OnSuggest = "on_suggest",
	Type = "type",
}

export interface FluffyPayload {
	text?: string;
	button_id?: string;
	caption?: string;
	request_id?: string;
	scenario_name?: ScenarioName;
	"@scenario_name"?: Namespace;
}

export enum ScenarioName {
	GeneralConversation = "GeneralConversation",
}

export enum SubName {
	GcSuggest = "gc_suggest",
}

export enum DirectiveType {
	ClientAction = "client_action",
	ServerAction = "server_action",
}

export enum ItemType {
	Action = "action",
}

export interface VoiceResponse {
	directives: VoiceResponseDirective[];
	should_listen: boolean;
	output_speech: Card;
}

export interface VoiceResponseDirective {
	name: string;
	payload: TentacledPayload;
	type: string;
}

export interface TentacledPayload {
	user_objects?: string;
	method?: string;
	key?: string;
	value?: string;
	listening_is_possible?: boolean;
}

export interface StreamcontrolRoot {
	streamcontrol: Streamcontrol;
}

export interface Streamcontrol {
	messageId: string;
	reason: number;
	action: number;
	streamId: number;
}

export interface IAliceClientOptions {
	/**
	 * @description API address
	 * @default 'wss://uniproxy.alice.ya.ru/uni.ws'
	 */
	server?: string;
	log?: boolean;
	autoReconnect?: boolean;
	connTimeout?: number;
	reqTimeout?: number;
	app?: {
		app_id: string;
		app_version: string;
		os_version: string;
		platform: string;
		uuid: string;
		lang: string;
		client_time: string;
		timezone: string;
		timestamp: string;
	};
}

export interface IAliceSendTextOptions {
	isTTS: boolean;
}

export interface IAliceTTSOptions {
	voice: string;
	lang: string;
	format: string;
	emotion: string;
	quality: string;
}

export interface IAliceActiveRequest {
	text?: Card;
	suggest?: Item[];
	audioFormat?: string;
	audioData?: Buffer;
	streamId?: string;
}

export interface IAliceResponsePayload {
	response: void;
}

export interface IAliceResponseHeader {
	name: "Speak" | "VinsResponse";
	messageId: string;
	refMessageId: string;
	namespace: "Vins" | "TTS";
	streamId?: number;
}

export interface IAliceResponseDirective {
	header: IAliceResponseHeader;
	payload: IAliceResponsePayload;
}

export interface IAliceStreamcontrol {
	messageId: string;
	streamId: number;
}

export interface IAliceStreamcontrolResponse {
	streamcontrol: IAliceStreamcontrol;
}

export interface IAliceSendTextResponse {
	response: void;
	audio?: Buffer;
}

export interface IAliceSynchronizeState {
	auth_token: string;
	uuid: string;
	lang: string;
	voice: string;
}
