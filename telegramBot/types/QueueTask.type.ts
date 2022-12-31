import { TypegramMessage } from "./TypegramMessage.type";

export type QueueTask = {
  question: string;
  ctx: TypegramMessage;
};
