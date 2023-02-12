import type {
	InquirerActionExecuteParams,
	InquirerActionResponse,
} from "@inquirer/typings/Inquirer.typings";
import type BeeQueue from "bee-queue";
import { ClientError } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";
import type { InquirerJobPayload } from "../../typings/Inquirer.typings";
import type { User } from "../../typings/User.typings";

export default function onInquirerJob(
	this: TelegramBotThis,
	job: BeeQueue.Job<InquirerJobPayload>,
	done: BeeQueue.DoneCallback<InquirerActionResponse | null>,
): void {
	const { uid } = job.data;
	try {
		void this.broker.cacher
			?.get(uid)
			.then((u) => {
				const user = u as User;
				if (user) {
					return this.broker.call<InquirerActionResponse, InquirerActionExecuteParams>(
						"Inquirer.execute",
						{
							q: job.data.text,
							needTranslate: user.translatorEnabled,
							uid,
							lang: user.lang,
						},
					);
				}
				return null;
			})
			.then((result) => {
				done(!result ? new ClientError("USER_MISMATCH") : null, result);
			})
			.catch((error) => {
				this.logger.error("Unexpected:", error);
				done(error);
			});
	} catch (error) {
		this.logger.error(error);
	}
}
