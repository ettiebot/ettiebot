export default function beautifyRequestText(text: string): string {
  return text
    .replace(/\b(Ettie|Etti|Eti|Yetti|Yeti)(,?\s?)/giu, '')
    .replace(/(етти|ети|йети|йетти|бот)(,?\s?)/giu, '')
    .replace(/&#\d+;/g, '')
    .replace(/&/g, '')
    .replace(/^(.)/, (s) => s.toUpperCase())
    .trim();
}
