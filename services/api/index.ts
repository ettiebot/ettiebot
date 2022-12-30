import Translink from "@coryfoundation/translink";
import deasync from "deasync";
import { QueueContext } from "../../types";

export class ServicesApi {
  private bridge = new Translink({
    namespace: String(process.env.NETWORK_ID),
    requestTimeout: 180000,
    log: true,
    logger: console,
  });

  constructor() {
    this._connect();
  }

  private _connect() {
    let done = false;
    this.bridge.connect().then(() => (done = true));
    while (done === false) deasync.sleep(100);
    console.info("[API Service] Connected to bridge");
  }

  public async requestAnswer(
    question: string,
    history: QueueContext["history"]
  ) {
    return await this.bridge.get("ettie.io/ask", {
      question,
      history,
    });
  }
}
