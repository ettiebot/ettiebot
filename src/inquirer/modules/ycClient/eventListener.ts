export default (url): void => {
  const es = new EventSource(url);
  let text = '';

  es.addEventListener('intents', (e) => res(url, JSON.parse(e.data)));
  es.addEventListener('slots', (e) => res(url, JSON.parse(e.data)));
  es.addEventListener('appRankings', (e) => res(url, JSON.parse(e.data)));
  es.addEventListener('youChatAppData', (e) => res(url, JSON.parse(e.data)));
  es.addEventListener('youChatAppRankings', (e) =>
    res(url, JSON.parse(e.data)),
  );
  es.addEventListener('thirdPartySearchResults', (e) =>
    res(url, JSON.parse(e.data)),
  );
  es.addEventListener('youChatSerpResults', (e) =>
    res(url, JSON.parse(e.data)),
  );
  es.addEventListener('appData', (e) => res(url, JSON.parse(e.data)));
  es.addEventListener('youChatToken', (e) => {
    res(url, JSON.parse(e.data));
    text += JSON.parse(e.data).youChatToken;
  });
  es.addEventListener('done', () => {
    es.close();
    res(url, { done: true, text });
  });
  es.onerror = (e): void => {
    console.error(e);
    es.close();
    res(url, { done: false, error: e.toString() })
  };
};

const EventSource = (e): void => void e;
const res = (u: string, e: any) => void e && void u;
