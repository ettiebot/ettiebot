import TelegramBot from "./bot";
import { Network } from "./network";

const network = new Network();
const bot = new TelegramBot(network);

setImmediate(async () => {
  // Connect to the network
  await network.start();

  // Start the bot
  await bot.start();
});
