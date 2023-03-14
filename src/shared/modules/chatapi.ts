import axios from 'axios';
import { YouChatResponse } from '../ts/youchat.js';

export default async function capiReq(url: string, payload, token: string) {
  const res = await axios.get<{ result: YouChatResponse }>(url, {
    params: payload,
    headers: {
      'x-token': token,
    },
  });

  return res.data.result;
}
