import IORedis from "ioredis";
import { config } from "../../config";
import { Article } from "./schemas/article";

class DbSaver {
  redis: IORedis;

  constructor() {
    this.redis = new IORedis(config.db.redis);
  }

  async save(item: Article, key: string) {
    await this.redis.hset(key, item.taskId, JSON.stringify(item));
  }
}

export const dbSaver = new DbSaver();
