export default function checkMention(text: string | undefined): string[] | null | undefined {
	return (
		text?.split(" ")[0].match(/\b(Ettie|Etti|Eti|Yetti|Yeti)(,?\s?)/giu) ??
		text?.split(" ")[0].match(/(етти|ети|йети|йетти)(,?\s?)/giu)
	);
}
//
