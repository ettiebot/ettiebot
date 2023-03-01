export default function beautifyResponseText(text: string): string {
  return text
    .replace(new RegExp('\\[.*\\]\\(.*\\)', 'g'), '')
    .replace(/\[.*\]\(.*\)/g, '')
    .replace(/\[\[[0-9]*\]\]\s*\(.*\)/g, '')
    .replace('YouChat', 'Ettie')
    .replace('YouBot', 'Ettie')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}
