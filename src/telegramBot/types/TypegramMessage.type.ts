import { NarrowedContext } from "telegraf/typings";
import Context from "telegraf/typings/context";
import {
  Update,
  Message,
  ReplyMessage,
} from "telegraf/typings/core/types/typegram";
export type TypegramMessage = NarrowedContext<
  Context<Update>,
  Update.MessageUpdate<Message>
> & { message: { text: string; reply_to_message: ReplyMessage } };
export type TypegramInlineQuery = NarrowedContext<
  Context<Update>,
  Update.InlineQueryUpdate
>;
export type TypegramVoiceMessage = NarrowedContext<
  Context<Update>,
  {
    message: Update.New & Update.NonChannel & Message.VoiceMessage;
    update_id: number;
  }
>;
