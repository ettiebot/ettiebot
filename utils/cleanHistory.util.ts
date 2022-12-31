import { MessagesHistory } from "../shared/types";

export function cleanHistory(history: any): MessagesHistory {
  return history.map(({ question, answer }) => ({
    question,
    answer,
  }));
}
