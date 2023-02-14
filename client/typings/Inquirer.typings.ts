export interface InquirerJobPayload {
	text: string;
	uid: string;
	provider: string;
	tts: boolean;
}

export interface InquirerExecuteTTSPayload {
	q: string;
}
