import type {HTTPClient} from "../index.js";
import {ycReq} from "./routes/yc.js";

export default function registerRoutes(this: HTTPClient) {
  ycReq.bind(this)();
}
