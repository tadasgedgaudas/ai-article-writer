import { Queue } from "bullmq";
import { config } from "../../config";
import IORedis from "ioredis";

const connection = new IORedis(config.db.redis);

export const taskQueue = new Queue("writerBoiTasks", { connection });
