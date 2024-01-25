import IORedis from "ioredis";
import { config } from "../../config";

class DbGetter {
  redis: IORedis;

  constructor() {
    this.redis = new IORedis(config.db.redis);
  }

  async get(key: string, cursor: string, count: number) {
    const [nextCursor, items] = await this.redis.hscan(
      key,
      cursor,
      "COUNT",
      count,
    );

    const results = [];
    for (let i = 0; i < items.length; i += 2) {
      results.push(JSON.parse(items[i + 1]));
    }

    console.log(results.length);
    return { nextCursor, results };
  }
}

export const dbGetter = new DbGetter();
