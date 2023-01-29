import { Browser } from "./browser";
import Worker from "./worker";
import YouChatScript from "./scripts/youChat.script";
import { REDIS_HOST, REDIS_PORT } from "./env";
import { ServiceBroker } from "moleculer";

const broker = new ServiceBroker({
  transporter: "redis://" + REDIS_HOST + ":" + REDIS_PORT,
  nodeID: "ettieWorker-" + Date.now().toString(36),
});

const browser = new Browser();

(async () => {
  // Start the browser
  const pBrowser = await browser.start();

  const ycScript = new YouChatScript(pBrowser);
  await ycScript.init();

  const worker = new Worker(ycScript);

  broker.createService({
    name: "worker",
    actions: {
      async ask(ctx) {
        return await worker.onAsk(ctx.params);
      },
    },
  });

  broker
    .start()
    .catch((err) => console.error(`Error occurred! ${err.message}`));
})();
