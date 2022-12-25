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
      const response = await self.client.get(uri);
      const unclearedArr = response.split("data: ");
      const clearedRespArr = unclearedArr.map((uncJson) => {
        try {
          return JSON.parse(uncJson.substring(0, uncJson.indexOf("\n")));
        } catch (_) {
          return {};
        }
      });

      const serpResults = clearedRespArr.find(
        (e: clearedRes) => e.serp_results
      );
      const tokens = clearedRespArr.filter((e: clearedRes) => e.token);
      const text = tokens
        .map((e: clearedRes) => e.token)
        .join("")
        .replace(/\(([^)]+)\)/g, "")
        .replace(/\[[^\]]*\]]/g, "");

      return {
        serpResults,
        text: text.trim(),
      };
    } catch (e) {
      throw e;
    }
  }
}
