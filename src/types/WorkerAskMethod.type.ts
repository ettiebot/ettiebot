import { MessagesHistory } from "./MessagesHistory.type";

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
    lang: string | null;
  };
};

export { WorkerAskMethodPayload, WorkerAskMethodResponse };
