import TPromise from "thread-promises";
import { Translate } from "../shared/translate.class";
import { Browser } from "./browser";
import { Network } from "./network";
import { NetworkAskMethodPayload } from "../shared/types";
import Worker from "./worker";

const network = new Network();
const browser = new Browser();
const translate = new Translate();
const worker = new Worker(network, browser, translate);

export async function start() {
  // Start the browser
  await browser.start();

  // Subscribe to request
  network.client.subscribeReq(
    "ettie.io/ask",
    async (data: NetworkAskMethodPayload) => {
      return await new TPromise(async (resolve, reject) =>
        worker.onAsk(data).then(resolve).catch(reject)
      );
    }
  );

  // Connect to the network
  await network.start();
}
