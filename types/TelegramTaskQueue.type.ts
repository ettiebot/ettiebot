import { TelegramBot } from "../bots/telegram";
import { TgTriggerContext } from "./TgContext.type";

export interface TelegramTaskQueue {
  ctx: TgTriggerContext;
  question: string;
  id: number;
  self: TelegramBot;
}
