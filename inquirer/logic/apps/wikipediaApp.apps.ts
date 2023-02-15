export interface WikipediaAppRoot {
	ydcAppName: string;
	data: Datum[];
	isFinal: boolean;
	timedOut: boolean;
	exactAbTestSlices: void;
	latency: number;
}

export interface Datum {
	title: string;
	url: string;
	intro: string;
	intro_image: string[];
	paragraph: Paragraph[];
}

export interface Paragraph {
	image: string[];
	index: number;
	title: string;
	content: string;
}

export default function wikipediaAppApply(data: WikipediaAppRoot): string {
	return `I found this on wikipedia:\n\n${data.data[0].title} - ${data.data[0].intro}`;
}
