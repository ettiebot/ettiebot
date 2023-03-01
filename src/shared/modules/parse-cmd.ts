import dialogflow from '@google-cloud/dialogflow';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CommandsPayload, CommandTypes, CommandActions } from '../ts/cmds.js';

const credentials = readFileSync(
  join('config', process.env.NODE_ENV, 'gc.credentials.json'),
  'utf8',
);
const parsedCredentials = JSON.parse(credentials);
const sessionClient = new dialogflow.SessionsClient({
  credentials: parsedCredentials,
});

export default async function parseCommand(
  text: string,
): Promise<CommandsPayload | null> {
  const sessionId = randomUUID();

  // Create a new session
  const sessionPath = sessionClient.projectAgentSessionPath(
    parsedCredentials.project_id,
    sessionId,
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  if (result.intent) {
    const type = result.intent.displayName as CommandTypes;
    const act = result.fulfillmentText as CommandActions;
    const opts = result.parameters.fields;
    if (act === 'unknown' || act === '') return null;
    return { type, act, opts, fetch: type === 'find-trigger' };
  } else return null;
}
