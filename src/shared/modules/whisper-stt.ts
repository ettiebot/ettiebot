import { FormData } from 'formdata-polyfill/esm.min.js';
import axios from 'axios';
import { File } from 'buffer';

export default async function whisperSpeechToText(
  buffer: Buffer,
  token: string,
) {
  try {
    const data = new FormData();
    data.append('file', new File([buffer], 'file.webm'));
    data.append('model', 'whisper-1');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + token,
        },
      },
    );

    return response.data?.text;
  } catch (error) {
    console.error(error);
    return null;
  }
}
