export default function checkMention(text: string | undefined): string[] | null | undefined {
	return (
		text?.match(/\b(Ettie|Etti|Eti|Yetti|Yeti)(,?\s?)/giu) ??
		text?.match(/(етти|ети|йети|йетти)(,?\s?)/giu)
	);
}
