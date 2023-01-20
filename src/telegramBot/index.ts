import TelegramBot from "./bot";

const bot = new TelegramBot();
bot.start();

process.on("uncaughtException", (e) => {
  bot.bot.telegram.sendMessage(
    bot.ownerChatId,
    "error\nname" + e.name + "\nmessage:" + e.message + "\nstack:" + e.stack
  );
  console.error(e);
});
