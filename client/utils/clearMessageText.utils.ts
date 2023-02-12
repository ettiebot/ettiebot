export default function clearMessageText(message: string): string {
	// Clear bot mentions
	const text = message
		.replace(/\b(Ettie|Etti|Eti|Yetti|Yeti)(,?\s?)/giu, "")
		.replace(/(етти|ети|йети|йетти|бот)(,?\s?)/giu, "")
		.replace(/&#\d+;/g, "")
		.replace(/&/g, "")
		.replace(/^(.)/, (s) => s.toUpperCase())
		.trim();

	return text;
}
