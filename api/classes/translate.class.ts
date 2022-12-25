import axios from "axios";
import { URLSearchParams } from "url";
import * as types from "../../types";

export class Translate {
  private detectApiUri: string =
    "https://translate.yandex.net/api/v1/tr.json/detect?sid=a270fab9.63a7a839.1122323c.74722d74657874&srv=tr-text&text={t}&hint=en%2Cru&options=1&yu=1899689071670005913&yum=1671808977755971984";
  private apiUri: string =
    "https://translate.yandex.net/api/v1/tr.json/translate?id=a270fab9.63a7a839.1122323c.74722d74657874-0-0&srv=tr-text&source_lang={sl}&target_lang={tl}&reason=auto&format=text&ajax=1&yu=1899689071670005913&yum=1671808977755971984";
  private userAgent: string =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

  public async translateLongText(text: string, to: string) {
    let resultText = "";
    let result;
    let words = text.split(".");

    console.log(words);

    if (words.length > 3) {
      while (words.length > 0) {
        const slicedWord = words.shift();
        if (slicedWord && slicedWord !== "") {
          result = await this.translate(slicedWord.trim() + ". ", to);
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

    const { data: res } = await axios.post<types.YandexTranslateRes>(
      this.apiUri.replace("{sl}", sourceLang).replace("{tl}", to),
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.userAgent,
        },
      }
    );

    return { sourceLang, ...res };
  }

  private async detectLang(text: string) {
    const { data: res } = await axios.get<types.YandexTranslateDetectRes>(
      this.detectApiUri.replace("{t}", text.substring(0, 100)),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.userAgent,
        },
      }
    );

    return res;
  }
}
