import getAverage from '../../../../inquirer/utils/avgArr.js';
import avgStringsArr from '../../../../inquirer/utils/avgStringsArr.js';
import { YouChatResponse } from '../../../ts/youchat.js';
import { WeatherAppDatum } from '../../../ts/youchat/weather.js';

export default function weatherAppParser(
  data: WeatherAppDatum,
): Partial<YouChatResponse> {
  void data;

  // Sunny, Snow, ...
  const weatherState = avgStringsArr(data.hourlyData.map((h) => h.IconPhrase));
  // Feels like
  const feelsLike = avgStringsArr(
    data.hourlyData.map((h) => h.RealFeelTemperature.Phrase),
  );
  // UV Index
  const uvIndex = avgStringsArr(data.hourlyData.map((h) => h.UVIndexText));
  // Snow probability
  const snowProbability = Math.round(
    getAverage(data.hourlyData.map((h) => h.SnowProbability)),
  );
  // Visibility
  const visibility = Math.round(
    getAverage(data.hourlyData.map((h) => h.Visibility.Value / 0.62137)),
  );
  // Average temperature
  const avgTemp = Math.round(
    getAverage(data.hourlyData.map((h) => (h.Temperature.Value - 32) / 1.8)),
  );

  return {
    text: `The weather in ${data.locationName} today is predominantly ${weatherState}. The average air temperature is ${avgTemp} degrees. The weather feels like ${feelsLike}. Snow probability is ${snowProbability}%. UV Index is ${uvIndex}. Visibility is ${visibility} meters.`,
  };
}
