import { YouChatSerpResult } from "../../types";

export type AskQuestionResponse = {
  answer: string;
  searchResults: YouChatSerpResult[];
};
