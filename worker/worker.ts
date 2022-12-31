import { Translate } from "../shared/translate.class";
import { cleanHistory } from "../utils";
import { Browser } from "./browser";
import { YOUCHAT_API_URL } from "./env";
import { Network } from "./network";
import {
  WorkerAskMethodPayload,
  WorkerAskMethodResponse,
} from "../shared/types";

export default class Worker {
  client: Network;
  browser: Browser;
  translate: Translate;

  constructor(network: Network, browser: Browser, translate: Translate) {
    this.client = network;
    this.browser = browser;
    this.translate = translate;
  }

  /**
   * When an event came in asking a question
   * @param param0 WorkerAskMethodPayload
   * @result string
   */
  async onAsk({
    question,
    history = [],
  }: WorkerAskMethodPayload): Promise<WorkerAskMethodResponse> {
    // Translate the question into english
    const {
      sourceLang: questionSrcLang,
      text: [questionEN],
    } = await this.translate.translate(question, "en");

    // Retreive answer from AI
    const answerEN = await this.browser.get(
      YOUCHAT_API_URL.replace("{q}", encodeURIComponent(questionEN)).replace(
        "{h}",
        encodeURIComponent(JSON.stringify(cleanHistory(history)))
      )
    );

    // Translate the answer into question language
    const {
      text: [answer],
    } = await this.translate.translateLongText(answerEN, questionSrcLang);

    return {
      question: {
        question,
        questionEN,
        lang: questionSrcLang,
      },
      answer: {
        text: answer.trim(),
        textEN: answerEN.trim(),
        lang: questionSrcLang,
      },
    };
  }
}
