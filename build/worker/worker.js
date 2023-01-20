"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const translatte = require("translatte");
class Worker {
    constructor(network, ycScript) {
        this.client = network;
        this.ycScript = ycScript;
    }
    /**
     * When an event came in asking a question
     * @param param0 WorkerAskMethodPayload
     * @result string
     */
    onAsk({ question: questionOrig, history = [], }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Translate the question into english
            const { text: question, from: { language: { iso: srcLang }, }, } = yield translatte(questionOrig, {
                to: "en",
            });
            // Retreive answer from AI
            const answerOrig = yield this.ycScript.askQuestion(question);
            // Translate the question into original language
            const { text: answer } = yield translatte(answerOrig, {
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
        });
    }
}
exports.default = Worker;
