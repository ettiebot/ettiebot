import { Browser } from "./browser";
import { Network } from "./network";
import Worker from "./worker";
import YouChatScript from "./scripts/youChat.script";

const network = new Network();
const browser = new Browser();

setImmediate(async () => {
  // Start the browser
  const pBrowser = await browser.start();

  const ycScript = new YouChatScript(pBrowser);
  await ycScript.init();

  const worker = new Worker(network, ycScript);

  console.log(
    await worker.onAsk({ question: "Сколько будет 10+50?", history: [] })
  );
  console.log(
    await worker.onAsk({
      question: "Как правильно заниматься сексом?",
      history: [],
    })
  );
  console.log(
    await worker.onAsk({
      question: "Напиши длинную сказку про поросёнка",
      history: [],
    })
  );

  // // Subscribe to request
  // network.client.subscribeReq(
  //   "ettie.io/ask",
  //   async (data: NetworkAskMethodPayload) => {
  //     return await new TPromise(async (resolve, reject) =>
  //       worker.onAsk(data).then(resolve).catch(reject)
  //     );
  //   }
  // );

  // // Connect to the network
  // await network.start();
});
