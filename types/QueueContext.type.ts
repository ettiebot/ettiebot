export interface QueueContext {
  question: string;
  history: {
    question: string;
    answer: string;
  }[];
}
