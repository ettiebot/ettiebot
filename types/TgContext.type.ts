import { Context, NarrowedContext } from "telegraf";
import {
  Update,
  Message,
  CallbackQuery,
} from "telegraf/typings/core/types/typegram";

export type TgMsgContext =
  | NarrowedContext<
      Context<Update> & {
        match: RegExpExecArray;
      },
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >
  | NarrowedContext<
      Context<Update>,
      Update.MessageUpdate<Message> & { message: { reply_to_message: any } }
    >;

export type TgTriggerContext = NarrowedContext<
  Context<Update> & {
    match: RegExpExecArray;
  },
  {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }
>;

export type TgCleanMsgContext = NarrowedContext<
  Context<Update>,
  Update.MessageUpdate<Message>
>;

export type TgActionContext = NarrowedContext<
  Context<Update> & {
    match: RegExpExecArray;
  },
  Update.CallbackQueryUpdate<CallbackQuery>
>;
