import { YouChatResponse } from '../../ts/youchat.js';
import { WeatherAppDatum } from '../../ts/youchat/weather.js';
import { WikipediaAppDatum } from '../../ts/youchat/wikipedia.js';
import weatherAppParser from './apps/weather.js';
import wikipediaAppParser from './apps/wikipedia.js';

export default async function parseApps(
  result: Partial<YouChatResponse>,
): Promise<Partial<YouChatResponse> | null> {
  const appName = result['ydcAppName'];
  const appData = result['data']?.[0];
  if (appName === 'weather')
    return weatherAppParser(appData as WeatherAppDatum);
  else if (appName === 'wikipedia')
    return wikipediaAppParser(appData as WikipediaAppDatum);
  else return null;
}
