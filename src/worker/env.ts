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
    "https://you.com/api/streamingSearch?q={q}&page=1&count=1&safeSearch=Off&onShoppingPage=false&responseFilter=WebPages,Translations,TimeZone,Computation,RelatedSearches&domain=youchat&queryTraceId={uid}&history={h}"
  )
  .asUrlString();

export { REDIS_HOST, REDIS_PORT, YOUCHAT_API_URL };
