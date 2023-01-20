import parseEnv from "parse-dotenv";
import { from } from "env-var";

const _env = parseEnv();

process.env = {
  ...process.env,
  ..._env,
};

const env = from(_env);

const REDIS_HOST = env.get("REDIS_HOST").default("localhost").asString();
const REDIS_PORT = env.get("REDIS_PORT").default(6379).asPortNumber();
const YOUCHAT_API_URL = env
  .get("YOUCHAT_API_URL")
  .default(
    "https://you.com/api/streamingSearch?q={q}&page=1&count=10&safeSearch=Moderate&onShoppingPage=false&domain=youchat&queryTraceId=5577a8c4-696a-4795-b515-79ac815269a2&chat={h}"
  )
  .asUrlString();

export { REDIS_HOST, REDIS_PORT, YOUCHAT_API_URL };
