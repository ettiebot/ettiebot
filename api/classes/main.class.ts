import fastq from "fastq";
import { ChatGPTAPIBrowser } from "chatgpt";
import { QueueContext } from "../../types/index.js";
import { MainClassExecRes } from "../../types/MainClassExecRes.type.js";

interface clearedRes {
  token: string;
  serp_results: any[];
}

export class Main {
  private client: ChatGPTAPIBrowser = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL,
    password: process.env.OPENAI_PASSWORD,
    isGoogleLogin: true,
  });

  private queue = fastq.promise<
    any,
    { question: string; self: Main },
    MainClassExecRes
  >(this._exec, 3);

  constructor() {
    this._init();
  }

  private async _init() {
    await this.client.initSession();
  }

  public async askQuestion(
    question: QueueContext["question"],
    history?: QueueContext["history"]
  ) {
    return await this.queue.push({ question, self: this });
  }

  private async _exec({
    question,
    self,
  }: {
    question: string;
    self: Main;
  }): Promise<MainClassExecRes> {
    try {
      const result = await self.client.sendMessage(question);

      return {
        text: result.response,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
