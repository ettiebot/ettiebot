export function cleanAnswer(data: any): any {
	const regex = new RegExp("\\[.*\\]\\(.*\\)", "g");
	return { ...data, answer: data.answer.replace(regex, "") };
}
