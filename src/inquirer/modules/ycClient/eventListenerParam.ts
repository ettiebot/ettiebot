export default ({ url, param }): void => {
  const es = new EventSource(url);
  let text = '';

  const process = (e, p) => {
    if (param === p) {
      res(url, JSON.parse(e.data));
      res(url, { done: true, text });
      es.close();
    }
  };

  es.addEventListener('intents', (e) => process(e, 'intents'));
  es.addEventListener('slots', (e) => process(e, 'slots'));
  es.addEventListener('appRankings', (e) => {
    res(url, JSON.parse(e.data));
    if (param === 'appRankings') {
      res(url, { done: true, text });
      es.close();
    }
  });
  es.addEventListener('youChatAppData', (e) => process(e, 'youChatAppData'));
  es.addEventListener('youChatAppRankings', (e) =>
    process(e, 'youChatAppRankings'),
  );
  es.addEventListener('thirdPartySearchResults', (e) =>
    process(e, 'thirdPartySearchResults'),
  );
  es.addEventListener('youChatSerpResults', (e) =>
    process(e, 'youChatSerpResults'),
  );
  es.addEventListener('appData', (e) => process(e, 'appData'));
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
    res(url, { done: false, error: e.toString() });
  };
};

const EventSource = (e): void => void e;
const res = (u: string, e: any) => void e && void u;
