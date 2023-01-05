import axios, { AxiosError } from "axios";
import randomUseragent from "random-useragent";
import {
  YandexTranslateDetectResponse,
  YandexTranslateResponse,
} from "./types";

export class Translate {
  private detectApiUri: string =
    "https://translate.yandex.net/api/v1/tr.json/detect?sid=df68040b.63b0f245.f1239894.74722d74657874&srv=tr-text&text={t}&hint=en%2Cru&options=1&yu=1899689071670005913&yum=1671808977755971984";
  private apiUri: string =
    "https://translate.yandex.net/api/v1/tr.json/translate?id=df68040b.63b0f245.f1239894.74722d74657874-0-0&srv=tr-text&source_lang={sl}&target_lang={tl}&reason=auto&format=text&ajax=1&yu=1899689071670005913&yum=1671808977755971984";

  public async translateLongText(
    text: string,
    to: string
  ): Promise<YandexTranslateResponse> {
    let resultText = "";
    let result;
    let words = text.split(". ");

    if (words.length > 3) {
      while (words.length > 0) {
        const slicedWord = words.shift()?.trim();
        if (slicedWord && slicedWord !== "") {
          result = await this.translate(slicedWord + ". ", to);
          resultText += result.text;
        }
      }
    } else {
      result = await this.translate(text, to);
      resultText += result.text;
    }

    return { ...result, text: [resultText] };
  }

  public async translate(text: string, to: string) {
    const { lang: sourceLang } = await this.detectLang(text);

    const data = new URLSearchParams({
      text,
      options: "4",
    });

    const url = this.apiUri.replace("{sl}", sourceLang).replace("{tl}", to);
    console.log(url);

    const { data: res } = await axios.post<YandexTranslateResponse>(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": randomUseragent.getRandom(),
      },
    });

    return { sourceLang, ...res };
  }

  public async detectLang(text: string) {
    const url = this.detectApiUri.replace("{t}", text.substring(0, 100));
    console.log(url);

    let res = await axios
      .get<YandexTranslateDetectResponse>(url, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": randomUseragent.getRandom(),
        },
      })
      .then((r) => r.data)
      .catch((e: AxiosError) => {
        console.log(e.response.data, e.request);
      });

    if (!res || !res.lang) res = { code: 0, lang: "en" };

    return res;
  }
}
