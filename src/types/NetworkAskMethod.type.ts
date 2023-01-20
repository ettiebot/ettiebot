import { MessagesHistory } from "./MessagesHistory.type";

type NetworkAskMethodPayload = {
  question: string;
  history: MessagesHistory;
};

export { NetworkAskMethodPayload };
