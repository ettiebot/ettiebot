export default function clearAnswerText(answer: string): string {
	const text = answer
		.replace(/\[.*\]\(.*\)/g, "")
		.replace(/\[\[[0-9]*\]\]\s*\(.*\)/g, "")
		.replace("YouChat", "Ettie")
		.replace("YouBot", "Ettie");
	return text;
}
