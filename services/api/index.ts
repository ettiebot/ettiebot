import Translink from "@coryfoundation/translink";
import { QueueContext } from "../../types";

export class ServicesApi {
  private bridge = new Translink({
    namespace: String(process.env.NETWORK_ID),
    requestTimeout: 60000,
    log: true,
    logger: console,
  });

  constructor() {
    this._connect();
  }

  private async _connect() {
    await this.bridge.connect();
    console.info("[API Service] Connected to bridge");
  }

  public async requestAnswer(
    question: string,
    history: QueueContext["history"]
  ) {
    return await this.bridge.get("pptr.retreive", {
      question,
      history,
    });
  }
}
