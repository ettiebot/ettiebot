import dotenv from "dotenv";
import { WorkerService } from "./services/worker";
dotenv.config();
const worker = new WorkerService();
