import parseEnv from "parse-dotenv";
import { from } from "env-var";

const _env = parseEnv();

process.env = {
  ...process.env,
  ..._env,
};

const env = from(_env);

const TELEGRAM_BOT_TOKEN = env.get("TELEGRAM_BOT_TOKEN").required().asString();
const TELEGRAM_BOT_USERNAME = env
  .get("TELEGRAM_BOT_USERNAME")
  .required()
  .asString();
const REDIS_HOST = env.get("REDIS_HOST").default("localhost").asString();
const REDIS_PORT = env.get("REDIS_PORT").default(6379).asPortNumber();

export { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, REDIS_HOST, REDIS_PORT };
