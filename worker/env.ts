import parseEnv from "parse-dotenv";
import { from } from "env-var";

process.env = parseEnv();
const env = from(process.env);

const NETWORK_ID = env.get("NETWORK_ID").required().asString();
const YOUCHAT_API_URL = env
  .get("YOUCHAT_API_URL")
  .default("https://you.com/api/youchatStreaming?question={q}&chat={h}")
  .asUrlString();

export { NETWORK_ID, YOUCHAT_API_URL };
