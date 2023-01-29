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
  public async onAsk({
    question,
    history = [],
    withoutTranslate = false,
  }: WorkerAskMethodPayload): Promise<WorkerAskMethodResponse> {
    if (!withoutTranslate) {
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
        answerOrig.answer,
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
          textEN: answerOrig.answer.trim(),
          searchResults: answerOrig.searchResults,
          lang: to,
        },
      };
    } else {
      // Retreive answer from AI
      const answerOrig = cleanAnswer(
        await this.ycScript.askQuestion(question, history)
      );

      return {
        question: {
          question: question.trim(),
          questionEN: question.trim(),
          lang: null,
        },
        answer: {
          text: answerOrig.answer.trim(),
          textEN: answerOrig.answer.trim(),
          searchResults: answerOrig.searchResults,
          lang: null,
        },
      };
    }
  }
}
