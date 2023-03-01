import z from 'zod';
import { youChatHistory } from './youchat.js';

export const tokenSchema = z.object({
  _id: z.string(),
  token: z.string(),
  userId: z.string(),
});

export const userSchema = z.object({
  _id: z.string(),
  tgId: z.number().optional(),
  botSettings: z
    .object({
      lang: z.string().default('en-US'),
      translateEnabled: z.boolean().default(true),
      historyEnabled: z.boolean().default(true),
      platform: z.string().default('youchat'),
      tts: z
        .object({
          enabled: z.boolean(),
          voice: z.string(),
          withText: z.boolean(),
        })
        .default({
          enabled: true,
          voice: 'shitova.us',
          withText: true,
        }),
      history: youChatHistory.default([]),
    })
    .default({}),
  appSettings: z.object({
    lang: z.string().default('en-US'),
    translateEnabled: z.boolean().default(true),
    historyEnabled: z.boolean().default(true),
    tts: z
      .object({
        enabled: z.boolean(),
        voice: z.string(),
      })
      .default({
        enabled: true,
        voice: 'shitova.us',
      }),
    history: youChatHistory.default([]),
  }),
});

export type Token = z.infer<typeof tokenSchema>;
export type User = z.infer<typeof userSchema>;
