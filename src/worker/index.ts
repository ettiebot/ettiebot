import { Browser } from "./browser";
import { Network } from "./network";
import Worker from "./worker";
import YouChatScript from "./scripts/youChat.script";
import { NetworkAskMethodPayload } from "../types";

const network = new Network();
const browser = new Browser();

setImmediate(async () => {
  // Start the browser
  const pBrowser = await browser.start();

  const ycScript = new YouChatScript(pBrowser);
  await ycScript.init();

  const worker = new Worker(network, ycScript);

  // Subscribe to request
  network.client.subscribeReq(
    "ettie.io/ask",
    async (data: NetworkAskMethodPayload) => {
      try {
        return await worker.onAsk(data);
      } catch (e) {
        console.error(e);
        return {
          question: {
            question: data.question,
            questionEN: data.question,
            lang: "en",
          },
          answer: {
            question: "An error occurred. Please try again later.",
            questionEN: "An error occurred. Please try again later.",
            lang: "en",
          },
        };
      }
    }
  );

  // Connect to the network
  await network.start();
});