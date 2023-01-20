import { MessagesHistory, MessagesHistoryItem } from "../types";

export function cleanHistory(history: MessagesHistoryItem[]): MessagesHistory {
  return history.map(({ question, answer }) => ({
    question,
    answer,
  }));
}
