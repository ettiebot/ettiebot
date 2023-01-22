import { WorkerAskMethodPayload, WorkerAskMethodResponse } from "../types";
import YouChatScript from "./scripts/youChat.script";
import { YandexTranslator } from "../translator/translators/YandexTranslator/index";
import randomUseragent from "random-useragent";
import { cleanAnswer } from "../translator/util/cleanAnswer";

export default class Worker {
  ycScript: YouChatScript;
  yandexTranslator: YandexTranslator;

  constructor(ycScript: YouChatScript) {
    this.ycScript = ycScript;
    this.yandexTranslator = new YandexTranslator({
      headers: {
        "User-Agent": randomUseragent.getRandom(),
      },
    });
  }

  /**
   * When an event came in asking a question
   * @param param0 WorkerAskMethodPayload
   * @result string
   */
  async onAsk({
    question,
    history = [],
  }: WorkerAskMethodPayload): Promise<any> {
    const { text, from, to } = await this.yandexTranslator.translate(
      question,
      "auto",
      "en"
    );

    // Retreive answer from AI
    const answerOrig = cleanAnswer(
      await this.ycScript.askQuestion(text, history)
    );

    // Translate the question into original language
    const { text: answer } = await this.yandexTranslator.translate(
      answerOrig,
      "en",
      from
    );

    return {
      question: {
        question: question.trim(),
        questionEN: text.trim(),
        lang: from,
      },
      answer: {
        text: answer.trim(),
        textEN: answerOrig.trim(),
        lang: to,
      },
    };
  }
}
