import parseEnv from "parse-dotenv";
import { from } from "env-var";

const env = from(parseEnv());

const NETWORK_ID = env.get("NETWORK_ID").required().asString();
const YOUCHAT_API_URL = env
  .get("YOUCHAT_API_URL")
  .default(
    "https://you.com/api/streamingSearch?q={q}&page=1&count=10&safeSearch=Moderate&onShoppingPage=false&domain=youchat&queryTraceId=5577a8c4-696a-4795-b515-79ac815269a2&chat={h}"
  )
  .asUrlString();

export { NETWORK_ID, YOUCHAT_API_URL };
