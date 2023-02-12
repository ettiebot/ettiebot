import { ClientError } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { UserLanguage } from "../../typings/Language.typings";
import { LanguageEnum } from "../../typings/Language.typings";
import clearAnswerText from "../../utils/clearAnswerText.utils";

export default async function tts(
	this: TelegramBotThis,
	text: string,
	lang: string,
): Promise<string | Uint8Array | null | undefined> {
	try {
		const audio = await this.alice.tts(clearAnswerText(text));
		return audio;

		// const langCode = LanguageEnum[lang as UserLanguage];
		// // Construct the request
		// const request = {
		// 	input: { text },
		// 	// Select the language and SSML voice gender (optional)
		// 	voice: { languageCode: langCode, ssmlGender: 2 },
		// 	// select the type of audio encoding
		// 	audioConfig: { audioEncoding: 3 },
		// };

		// // Performs the text-to-speech request
		// const [response] = await this.gcTTS.synthesizeSpeech(request);
		// // Write the binary audio content to a local file
		// return response.audioContent;
	} catch (error) {
		throw new ClientError("TTS_ERROR");
	}
}
