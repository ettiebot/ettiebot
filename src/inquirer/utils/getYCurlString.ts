import { randomUUID } from 'crypto';
import { YouChatReqPayload } from '../../shared/ts/inq.js';

export default function getYCApiUrl(payload: YouChatReqPayload): string {
  const opts = {
    page: 1,
    count: payload.searchResCount,
    safeSearch: payload.safeSearch ? 'On' : 'Off',
    onShoppingPage: false,
    mkt: '',
    responseFilter:
      'WebPages,Translations,TimeZone,Computation,RelatedSearches',
    domain: 'youchat',
    queryTraceId: payload.chatId ?? randomUUID(),
    q: payload.text,
    chatId: payload.chatId,
    history: encodeURIComponent(JSON.stringify(payload.history)),
  };

  const str = Object.entries(opts)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  return `https://you.com/api/streamingSearch?${str}`;
}
