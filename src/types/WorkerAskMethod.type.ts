import { MessagesHistory } from "./MessagesHistory.type";
import { YouChatSerpResult } from "./YouChatSerpResult.type";

type WorkerAskMethodPayload = {
  question: string;
  history: MessagesHistory;
  withoutTranslate?: boolean;
};

type WorkerAskMethodResponse = {
  question: {
    question: string;
    questionEN: string;
    lang: string | null;
  };
  answer: {
    text: string;
    textEN: string;
    searchResults: YouChatSerpResult[];
    lang: string | null;
  };
};

export { WorkerAskMethodPayload, WorkerAskMethodResponse };
