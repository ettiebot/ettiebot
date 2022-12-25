import { Puppeteer } from "./pptr.class";

export class Main {
  private youChatStreamingUrl: string =
    "https://you.com/api/youchatStreaming?question={q}&chat={h}";
  private client: Puppeteer = new Puppeteer();

  async askQuestion(question: string, pastAnswer?: string) {
    const history = pastAnswer
      ? [
          {
            question: "",
            answer: pastAnswer,
          },
        ]
      : [];
    const uri = this.youChatStreamingUrl
      .replace("{q}", encodeURIComponent(question))
      .replace("{h}", encodeURIComponent(JSON.stringify(history)));

    try {
      const response = await this.client.get(uri);
      const unclearedArr = response.split("data: ");
      const clearedRespArr = unclearedArr.map((uncJson) => {
        try {
          return JSON.parse(uncJson.substring(0, uncJson.indexOf("\n")));
        } catch (_) {
          return {};
        }
      });

      const serpResults = clearedRespArr.find((e) => e.serp_results);
      const tokens = clearedRespArr.filter((e) => e.token);
      const text = tokens.map((t) => t.token).join("");

      return {
        serpResults,
        text,
      };
    } catch (e) {
      throw e;
    }
  }
}
