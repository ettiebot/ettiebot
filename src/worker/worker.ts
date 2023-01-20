import { WorkerAskMethodPayload, WorkerAskMethodResponse } from "../types";
import YouChatScript from "./scripts/youChat.script";
const translatte = require("translatte");

export default class Worker {
  ycScript: YouChatScript;

  constructor(ycScript: YouChatScript) {
    this.ycScript = ycScript;
  }

  /**
   * When an event came in asking a question
   * @param param0 WorkerAskMethodPayload
   * @result string
   */
  async onAsk({
    question: questionOrig,
    history = [],
  }: WorkerAskMethodPayload): Promise<any> {
    // Translate the question into english
    const {
      text: question,
      from: {
        language: { iso: srcLang },
      },
    } = await translatte(questionOrig, {
      to: "en",
    });

    // Retreive answer from AI
    const answerOrig = await this.ycScript.askQuestion(question);

    // Translate the question into original language
    const { text: answer } = await translatte(answerOrig, {
      to: srcLang,
    });

    return {
      question: {
        question: questionOrig.trim(),
        questionEN: question.trim(),
        lang: srcLang,
      },
      answer: {
        text: answer.trim(),
        textEN: answerOrig.trim(),
        lang: "en",
      },
    };
  }
}
