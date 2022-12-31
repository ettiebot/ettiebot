import Translink from "@coryfoundation/translink";
import { NETWORK_ID } from "./env";

export class Network {
  public client: Translink;

  constructor() {
    this.client = new Translink({
      namespace: NETWORK_ID,
      waitForPeer: false,
      requestTimeout: 180000,
      log: true,
    });
  }

  /**
   * Initialize network class
   */
  public async start() {
    await this.client.connect();
    console.info("Network has been started");
  }
}
