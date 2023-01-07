import { MessagesHistory } from "./MessagesHistory.type";

type WorkerAskMethodPayload = {
  question: string;
  history: MessagesHistory;
};

type WorkerAskMethodResponse = {
  question: {
    question: string;
    questionEN?: string;
    lang?: string;
  };
  answer: {
    text: string;
    textEN?: string;
    lang?: string;
  };
};

export { WorkerAskMethodPayload, WorkerAskMethodResponse };
