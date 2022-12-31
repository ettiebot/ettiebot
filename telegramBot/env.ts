import parseEnv from "parse-dotenv";
import { from } from "env-var";

process.env = parseEnv();
const env = from(process.env);

const TELEGRAM_BOT_TOKEN = env.get("TELEGRAM_BOT_TOKEN").required().asString();
const TELEGRAM_BOT_USERNAME = env
  .get("TELEGRAM_BOT_USERNAME")
  .required()
  .asString();
const NETWORK_ID = env.get("NETWORK_ID").required().asString();
const REDIS_HOST = env.get("REDIS_HOST").default("localhost").asString();
const REDIS_PORT = env.get("REDIS_PORT").default(6379).asPortNumber();

export {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
  NETWORK_ID,
  REDIS_HOST,
  REDIS_PORT,
};
