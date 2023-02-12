export default function clearAnswerText(answer: string): string {
	const text = answer
		.replace(/\[.*\]\(.*\)/g, "")
		.replace("YouChat", "Ettie")
		.replace("YouBot", "Ettie");
	return text;
}
