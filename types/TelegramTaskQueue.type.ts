import { TelegramBot } from "../bots/telegram";
import { TgActionContext, TgTriggerContext } from "./TgContext.type";

export interface TelegramTaskQueue {
  ctx: TgTriggerContext | TgActionContext;
  question: string;
  id: number;
  self: TelegramBot;
}
