import { TranslationServiceClient } from '@google-cloud/translate';
import { readFileSync } from 'fs';
import { join } from 'path';

const credentials = readFileSync(
  join('config', process.env.NODE_ENV, 'gc.credentials.json'),
  'utf8',
);
const translator = new TranslationServiceClient({
  credentials: JSON.parse(credentials),
});

const projectId = JSON.parse(credentials).project_id;

export async function translateGT(text: string, to: string, from?: string) {
  const [response] = await translator.translateText({
    contents: [text],
    targetLanguageCode: to,
    sourceLanguageCode: from,
    parent: `projects/${projectId}`,
  });

  const translation = response.translations[0];
  from = from ?? translation.detectedLanguageCode;

  console.log(translation);

  return { from, to, text: translation.translatedText };
}
