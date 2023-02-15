/* eslint-disable @typescript-eslint/naming-convention */
export interface WeatherAppRoot {
	ydcAppName: string;
	data: Datum[];
	isFinal: boolean;
	timedOut: boolean;
	latency: number;
}

export interface Datum {
	locationName: string;
	weeklyData: WeeklyData;
	hourlyData: HourlyDatum[];
	aqiDailyData: AqiDailyData;
	aqiCurrentData: AqiCurrentData;
}

export interface AqiCurrentData {
	success: boolean;
	status: string;
	version: number;
	data: DAT;
}

export interface DAT {
	date: Date;
	epochDate: number;
	overallIndex: number;
	overallPlumeLabsIndex: number;
	dominantPollutant: string;
	category: string;
	categoryColor: string;
	hazardStatement: string;
	link: string;
}

export interface AqiDailyData {
	success: boolean;
	status: string;
	version: number;
	data: DAT[];
}

export interface HourlyDatum {
	DateTime: Date;
	EpochDateTime: number;
	WeatherIcon: number;
	IconPhrase: string;
	HasPrecipitation: boolean;
	IsDaylight: boolean;
	Temperature: Ceiling;
	RealFeelTemperature: Ceiling;
	RealFeelTemperatureShade: Ceiling;
	WetBulbTemperature: Ceiling;
	DewPoint: Ceiling;
	Wind: Wind;
	WindGust: WindGust;
	RelativeHumidity: number;
	IndoorRelativeHumidity: number;
	Visibility: Ceiling;
	Ceiling: Ceiling;
	UVIndex: number;
	UVIndexText: string;
	PrecipitationProbability: number;
	ThunderstormProbability: number;
	RainProbability: number;
	SnowProbability: number;
	IceProbability: number;
	TotalLiquid: Ceiling;
	Rain: Ceiling;
	Snow: Ceiling;
	Ice: Ceiling;
	CloudCover: number;
	Evapotranspiration: Ceiling;
	SolarIrradiance: Ceiling;
	MobileLink: string;
	Link: string;
}

export interface Ceiling {
	Value: number;
	Unit: Unit;
	UnitType: number;
	Phrase?: string;
}

export enum Unit {
	F = "F",
	Ft = "ft",
	In = "in",
	Mi = "mi",
	MiH = "mi/h",
	WM = "W/m²",
}

export interface Wind {
	Speed: Ceiling;
	Direction: Direction;
}

export interface Direction {
	Degrees: number;
	Localized: string;
	English: string;
}

export interface WindGust {
	Speed: Ceiling;
}

export interface WeeklyData {
	Headline: Headline;
	DailyForecasts: DailyForecast[];
}

export interface DailyForecast {
	Date: Date;
	EpochDate: number;
	Sun: Sun;
	Moon: Moon;
	Temperature: RealFeelTemperature;
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

export interface AirAndPollen {
	Name: string;
	Value: number;
	Category: string;
	CategoryValue: number;
	Type?: string;
}

export interface Day {
	Icon: number;
	IconPhrase: string;
	HasPrecipitation: boolean;
	ShortPhrase: string;
	LongPhrase: string;
	PrecipitationProbability: number;
	ThunderstormProbability: number;
	RainProbability: number;
	SnowProbability: number;
	IceProbability: number;
	Wind: Wind;
	WindGust: Wind;
	TotalLiquid: Ceiling;
	Rain: Ceiling;
	Snow: Ceiling;
	Ice: Ceiling;
	HoursOfPrecipitation: number;
	HoursOfRain: number;
	HoursOfSnow: number;
	HoursOfIce: number;
	CloudCover: number;
	Evapotranspiration: Ceiling;
	SolarIrradiance: Ceiling;
}

export interface DegreeDaySummary {
	Heating: Ceiling;
	Cooling: Ceiling;
}

export interface Moon {
	Rise: Date;
	EpochRise: number;
	Set: Date;
	EpochSet: number;
	Phase: string;
	Age: number;
}

export interface RealFeelTemperature {
	Minimum: Ceiling;
	Maximum: Ceiling;
}

export interface Sun {
	Rise: Date;
	EpochRise: number;
	Set: Date;
	EpochSet: number;
}

export interface Headline {
	EffectiveDate: Date;
	EffectiveEpochDate: number;
	Severity: number;
	Text: string;
	Category: string;
	EndDate: Date;
	EndEpochDate: number;
	MobileLink: string;
	Link: string;
}

export default function weatherAppApply(data: WeatherAppRoot): string {
	const today = data.data[0].hourlyData;
	return `Weather in "${data.data[0].locationName}" for today is...`;
}
