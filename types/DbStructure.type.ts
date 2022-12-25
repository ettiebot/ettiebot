export interface DbStructure {
  history: {
    [key: string]: {
      [key: string]: {
        question: string;
        answer: string;
      }[];
    };
  };
}
