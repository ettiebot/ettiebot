import { z } from 'zod';

export const INTENT_NAMES = ['findInApp', 'unknown'] as const;
export type IntentNames = (typeof INTENT_NAMES)[number];

export const intentParameters = z.object({
  appName: z.string().optional(),
  searchQuery: z.string().optional(),
});
export type IntentParameters = z.infer<typeof intentParameters>;

export const commandsPayload = z.object({
  intentName: z.enum(INTENT_NAMES),
  parameters: intentParameters, // TODO: add more parameters
});

export type CommandsPayload = z.infer<typeof commandsPayload>;
