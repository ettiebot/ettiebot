import { z } from 'zod';

export const COMMAND_TYPES = [
  'sound',
  'find-in-search',
  'find-trigger',
  'open-site',
] as const;
export type CommandTypes = (typeof COMMAND_TYPES)[number];

export const COMMAND_ACTIONS = ['volume', 'unknown', ''] as const;
export type CommandActions = (typeof COMMAND_ACTIONS)[number];

export const triggerWords = {
  power: [
    'turn off the computer',
    'turn off the pc',
    'turn off the bakery',
    'turn off my computer',
    'turn off your computer',
    'restart the computer',
    'restart the pc',
    'restart the bakery',
    'restart my computer',
    'restart your computer',
  ],
  openBrowser: [
    'open the browser',
    'open browser',
    'open the internet',
    'open internet',
    'open the web',
    'open web',
    'open search',
    'open the search',
    'open your browser',
    'open my browser',
  ],
  audio: [
    'volume by ',
    'volume to ',
    'volume at ',
    'volume up to ',
    'volume up by ',
    'sound at ',
    'sound to ',
    'sound by ',
    'turn down the volume',
    'turn up the volume',
    'higher volume',
    'lower volume',
    'hush the sound',
    'turn off the sound',
    'turn on the sound',
    'make it quieter',
    'turn it down',
    'turn it up',
    'volume up to maximum',
    'full volume',
    'maximum sound output',
  ],
};

export const commandsPayload = z
  .object({
    type: z.enum(COMMAND_TYPES),
    act: z.enum(COMMAND_ACTIONS),
    opts: z.object({
      'sound-volume-action': z.object({ stringValue: z.string() }),
      percentage: z.object({ stringValue: z.string() }),
    }),
    fetch: z.boolean().default(false),
  })
  .optional();

export type CommandsPayload = z.infer<typeof commandsPayload>;
