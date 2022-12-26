import dotenv from "dotenv";
import { WorkerService } from "./services/worker/index.js";
dotenv.config();
const worker = new WorkerService();
