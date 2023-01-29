import { AskQuestionResponse } from "../../worker/types";

export function cleanAnswer(data: AskQuestionResponse): AskQuestionResponse {
  let regex = new RegExp("\\[.*\\]\\(.*\\)", "g");
  return { ...data, answer: data.answer.replace(regex, "") };
}
