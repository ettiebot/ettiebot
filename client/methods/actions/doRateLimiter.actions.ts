import { ClientError } from "../../errors";
import type { TelegramBotThis } from "../../services/bots/telegram.bot.service";

export default async function doRateLimiter(
	this: TelegramBotThis,
	userId: number | undefined,
): Promise<void> {
	if (!userId) {
		throw new ClientError("USER_ID_MISMATCH");
	}

	// Check rate limit
	const key = `${userId}:l`;
	const limit = await this.broker.cacher?.get(key);
	if (limit) {
		throw new ClientError("RATE_LIMIT");
	}

	// Set rate limit
	await this.broker.cacher?.set(key, true, 10);
}
