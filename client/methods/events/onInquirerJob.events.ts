import { randomUUID } from "crypto";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type {
	InquirerActionAliceExecuteParams,
	InquirerActionAliceResponse,
	InquirerActionExecuteParams,
	InquirerActionResponse,
} from "../../typings/Inquirer/Inquirer.typings";
import type { InquirerJobPayload } from "../../typings/Inquirer.typings";
import type { User } from "../../typings/User.typings";

export default async function onInquirerJob(
	this: TelegramBotThis,
	data: InquirerJobPayload,
): Promise<InquirerActionResponse | InquirerActionAliceResponse> {
	const { uid } = data;
	try {
		const user = (await this.broker.cacher?.get(uid)) as User;
		if (data.provider === "al") {
			return await this.broker.call<
				InquirerActionAliceResponse,
				InquirerActionAliceExecuteParams
			>("Inquirer.executeAlice", {
				q: data.text,
				uid,
				tts: data.tts,
				lang: user.lang,
			});
		}

		if (!user.ycId) {
			user.ycId = randomUUID();
			await this.broker.cacher?.set(uid, user);
		}

		return await this.broker.call<InquirerActionResponse, InquirerActionExecuteParams>(
			"Inquirer.execute",
			{
				q: data.text,
				needTranslate: user.translatorEnabled,
				uid,
				lang: user.lang,
				chatId: user.ycId,
			},
		);
	} catch (error) {
		this.logger.error(error);
		throw error;
	}
}
