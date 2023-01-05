import { TypegramMessage } from "./TypegramMessage.type";

export type QueueTask = {
  question: string;
  ctx: {
    chatId: number;
    userId: number;
    messageId: number;
  };
};
