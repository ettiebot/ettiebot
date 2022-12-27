import fastq from "fastq";
import { QueueContext } from "../../types";
import { MainClassExecRes } from "../../types/MainClassExecRes.type";
import { Puppeteer } from "./pptr.class";

interface clearedRes {
  token: string;
  serp_results: any[];
}

export class Main {
  private client: Puppeteer = new Puppeteer();
  private queue = fastq.promise<
    any,
    { uri: string; self: Main },
    MainClassExecRes
  >(this._exec, 3);
  private youChatStreamingUrl: string =
    "https://you.com/api/youchatStreaming?question={q}&chat={h}";

  public async askQuestion(
    question: QueueContext["question"],
    history?: QueueContext["history"]
  ) {
    const uri = this.youChatStreamingUrl
      .replace("{q}", encodeURIComponent(question))
      .replace("{h}", encodeURIComponent(JSON.stringify(history)));

    return await this.queue.push({ uri, self: this });
  }

  private async _exec({
    uri,
    self,
  }: {
    uri: string;
    self: Main;
  }): Promise<MainClassExecRes> {
    try {
      const text = await self.client.get(uri);

      return {
        serpResults: [],
        text: text
          .trim()
          .replace(/\(([^)]+)\)/g, "")
          .replace(/\[[^\]]*\]]/g, ""),
      };
    } catch (e) {
      throw e;
    }
  }
}
