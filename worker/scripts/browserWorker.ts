import { parentPort, workerData } from "worker_threads";
import { Browser } from "../browser";

const browser = new Browser();

parentPort.on("message", async ([action, data]) => {
  switch (action) {
    case "start":
      await browser.start();
      parentPort.postMessage(true);
      break;
    case "ask":
      const response = await browser.get(data);
      parentPort.postMessage(response);
      break;
  }
});
