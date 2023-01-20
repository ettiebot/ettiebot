import Translink from "@coryfoundation/translink";
import TPromise from "thread-promises";
import EventEmitter from "events";
import { WorkerAskMethodPayload, WorkerAskMethodResponse } from "../types";
import { NETWORK_ID } from "./env";

export class Network extends EventEmitter {
  public client = new Translink({
    namespace: NETWORK_ID,
    waitForPeer: true,
    requestTimeout: 180000,
    log: true,
  });

  /**
   * Initialize network class
   */
  public async start() {
    await this.client.connect();
    console.info("Network has been started");
  }

  public async ask(
    data: WorkerAskMethodPayload
  ): Promise<WorkerAskMethodResponse> {
    return await new TPromise((resolve, reject) =>
      this.client.get("ettie.io/ask", data).then(resolve).catch(reject)
    );
  }
}
