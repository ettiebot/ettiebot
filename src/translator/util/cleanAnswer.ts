export function cleanAnswer(text: string) {
  let regex = new RegExp("\\[.*\\]\\(.*\\)", "g");
  return text.replace(regex, "");
}
