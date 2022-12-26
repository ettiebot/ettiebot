import Translink from "@coryfoundation/translink";
import { sleep } from "../../api/utils/index.js";
import { QueueContext } from "../../types/index.js";

export class ServicesApi {
  private bridge = new Translink.default({
    namespace: String(process.env.NETWORK_ID),
    requestTimeout: 200000,
    log: true,
    logger: console,
  });

  public async connect() {
    await this.bridge.connect();
    await sleep(2000);
    console.info("[API Service] Connected to bridge");
  }

  public async requestAnswer(
    question: string,
    history: QueueContext["history"]
  ): Promise<{ text: string }> {
    return await this.bridge.get("pptr.retreive", {
      question,
      history,
    });
  }
}
