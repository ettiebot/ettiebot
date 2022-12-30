import Translink from "@coryfoundation/translink";
import deasync from "deasync";
import { QueueContext } from "../../types";
import * as API from "../../api";

export class WorkerService {
  private mainAPI: API.Main = new API.Main();

  private bridge = new Translink({
    namespace: String(process.env.NETWORK_ID),
    requestTimeout: 180000,
    log: true,
    logger: console,
  });

  constructor() {
    this.bridge.subscribeReq("ettie.io/ask", async (data) =>
      this.onRetreiveRequest(data)
    );
    this._connect();
  }

  private _connect() {
    let done = false;
    this.bridge.connect().then(() => (done = true));
    while (done === false) deasync.sleep(100);
    console.info("[Worker Service] Connected to bridge");
  }

  private async onRetreiveRequest({
    question,
    history,
  }: {
    question: string;
    history: QueueContext["history"];
  }) {
    console.info("[Worker Service] Retreive:", question);
    const answer = await this.mainAPI.askQuestion(question, history);
    console.log("[Worker Service] Response:", answer.text);
    return answer;
  }
}
