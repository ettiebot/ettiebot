import { youChatHistory, YouChatResponse } from './youchat.js';
import z from 'zod';
import { CommandsPayload } from './cmds.js';
import { userSchema } from './mongo.js';

export const youChatReqPayload = z.object({
  text: z.string(),
  history: youChatHistory.default([]),
  chatId: z.string().uuid().optional(),
  searchResCount: z.number().min(0).max(5).default(3),
  safeSearch: z.boolean().default(false),
  user: userSchema,
  opts: z.object({
    ttsEnabled: z.boolean().default(true),
    ttsVoice: z.string().default('shitova.us'),
  }),
});

export type YouChatReqPayload = z.infer<typeof youChatReqPayload>;

export interface YouChatReqResponse {
  result: YouChatResponse | null;
  cmds?: CommandsPayload;
  text?: string;
}

export type InquirerReqResponse = Partial<{
  result?: Partial<YouChatResponse>;
  voice?: string;
  cmds?: CommandsPayload;
}>;
