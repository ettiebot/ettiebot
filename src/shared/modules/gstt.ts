import { SpeechClient } from '@google-cloud/speech';
import { readFileSync } from 'fs';
import { join } from 'path';
import { deleteFile, uploadFile } from './gs.js';

const credentials = readFileSync(
  join('config', process.env.NODE_ENV, 'gc.credentials.json'),
  'utf8',
);
const speech = new SpeechClient({
  credentials: JSON.parse(credentials),
});

export async function speechToText(
  bucketName: string,
  buffer: Buffer,
  lang: string,
) {
  const fileName = await uploadFile(bucketName, buffer, 'oga');
  console.log('upload done', fileName);

  try {
    // Speech to text
    const [response] = await speech.recognize({
      audio: {
        uri: `gs://${bucketName}/${fileName}`,
      },
      config: {
        encoding: 9,
        sampleRateHertz: 48000,
        languageCode: lang,
        enableAutomaticPunctuation: true,
      },
    });

    // Check what response have a results
    if (!response.results || response.results.length === 0) {
      throw new Error('Nothing to transcribe');
    }

    const text = response.results
      .map((result) => result.alternatives?.[0].transcript)
      .join('\n')
      .trim();

    return text;
  } finally {
    await deleteFile(bucketName, fileName);
  }
}
