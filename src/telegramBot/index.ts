import TelegramBot from "./bot";
import { Network } from "./network";

const network = new Network();
const bot = new TelegramBot(network);

setImmediate(async () => {
  // Connect to the network
  await network.start().then(() => bot.start());
  console.log("network start");
});

process.on("uncaughtException", (e) => {
  bot.bot.telegram.sendMessage(
    bot.ownerChatId,
    "error\nname" + e.name + "\nmessage:" + e.message + "\nstack:" + e.stack
  );
  console.error(e);
});
