export interface WeatherAppDatum {
  locationName: string;
  weeklyData: WeeklyData;
  hourlyData: HourlyDatum[];
  aqiDailyData: AqiDailyData;
  aqiCurrentData: AqiCurrentData;
}

interface AqiCurrentData {
  success: boolean;
  status: string;
  version: number;
  data: Data;
}

interface Data {
  date: string;
  epochDate: number;
  overallIndex: number;
  overallPlumeLabsIndex: number;
  dominantPollutant: string;
  category: string;
  categoryColor: string;
  hazardStatement: string;
  link: string;
}

interface AqiDailyData {
  success: boolean;
  status: string;
  version: number;
  data: Datum[];
}

interface Datum {
  date: string;
  epochDate: number;
  overallPlumeLabsIndex: number;
  dominantPollutant: string;
  category: string;
  categoryColor: string;
  hazardStatement: string;
  link: string;
}

interface HourlyDatum {
  DateTime: string;
  EpochDateTime: number;
  WeatherIcon: number;
  IconPhrase: string;
  HasPrecipitation: boolean;
  IsDaylight: boolean;
  Temperature: Minimum;
  RealFeelTemperature: Minimum2;
  RealFeelTemperatureShade: Minimum2;
  WetBulbTemperature: Minimum;
  DewPoint: Minimum;
  Wind: Wind;
  WindGust: WindGust;
  RelativeHumidity: number;
  IndoorRelativeHumidity: number;
  Visibility: Minimum;
  Ceiling: Minimum;
  UVIndex: number;
  UVIndexText: string;
  PrecipitationProbability: number;
  ThunderstormProbability: number;
  RainProbability: number;
  SnowProbability: number;
  IceProbability: number;
  TotalLiquid: Minimum;
  Rain: Minimum;
  Snow: Minimum;
  Ice: Minimum;
  CloudCover: number;
  Evapotranspiration: Minimum;
  SolarIrradiance: Minimum;
  MobileLink: string;
  Link: string;
  PrecipitationType?: string;
  PrecipitationIntensity?: string;
}

interface WindGust {
  Speed: Minimum;
  Direction?: Direction;
}

interface WeeklyData {
  Headline: Headline;
  DailyForecasts: DailyForecast[];
}

interface DailyForecast {
  Date: string;
  EpochDate: number;
  Sun: Sun;
  Moon: Moon;
  Temperature: Temperature;
  RealFeelTemperature: RealFeelTemperature;
  RealFeelTemperatureShade: RealFeelTemperature;
  HoursOfSun: number;
  DegreeDaySummary: DegreeDaySummary;
  AirAndPollen: AirAndPollen[];
  Day: Day;
  Night: Day;
  Sources: string[];
  MobileLink: string;
  Link: string;
}

interface Day {
  Icon: number;
  IconPhrase: string;
  HasPrecipitation: boolean;
  PrecipitationType?: string;
  PrecipitationIntensity?: string;
  ShortPhrase: string;
  LongPhrase: string;
  PrecipitationProbability: number;
  ThunderstormProbability: number;
  RainProbability: number;
  SnowProbability: number;
  IceProbability: number;
  Wind: Wind;
  WindGust: Wind;
  TotalLiquid: Minimum;
  Rain: Minimum;
  Snow: Minimum;
  Ice: Minimum;
  HoursOfPrecipitation: number;
  HoursOfRain: number;
  HoursOfSnow: number;
  HoursOfIce: number;
  CloudCover: number;
  Evapotranspiration: Minimum;
  SolarIrradiance: Minimum;
}

interface Wind {
  Speed: Minimum;
  Direction: Direction;
}

interface Direction {
  Degrees: number;
  Localized: string;
  English: string;
}

interface AirAndPollen {
  Name: string;
  Value: number;
  Category: string;
  CategoryValue: number;
  Type?: string;
}

interface DegreeDaySummary {
  Heating: Minimum;
  Cooling: Minimum;
}

interface RealFeelTemperature {
  Minimum: Minimum2;
  Maximum: Minimum2;
}

interface Minimum2 {
  Value: number;
  Unit: string;
  UnitType: number;
  Phrase: string;
}

interface Temperature {
  Minimum: Minimum;
  Maximum: Minimum;
}

interface Minimum {
  Value: number;
  Unit: string;
  UnitType: number;
}

interface Moon {
  Rise: string;
  EpochRise: number;
  Set: string;
  EpochSet: number;
  Phase: string;
  Age: number;
}

interface Sun {
  Rise: string;
  EpochRise: number;
  Set: string;
  EpochSet: number;
}

interface Headline {
  EffectiveDate: string;
  EffectiveEpochDate: number;
  Severity: number;
  Text: string;
  Category: string;
  EndDate: string;
  EndEpochDate: number;
  MobileLink: string;
  Link: string;
}
