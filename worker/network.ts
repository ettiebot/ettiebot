import Translink from "@coryfoundation/translink";
import EventEmitter from "events";
import { NETWORK_ID } from "./env";

export class Network extends EventEmitter {
  public client = new Translink({
    namespace: NETWORK_ID,
    waitForPeer: false,
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
}
