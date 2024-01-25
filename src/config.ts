export const config = {
  api: {
    url: "http://localhost:3000",
  },
  db: {
    redis: process.env.redis_server_addr || "localhost",
    redisPort: 6379,
  },
  keys: {
    openai: process.env.OPENAI_API_KEY,
    replicate: process.env.REPLICATE_API_KEY,
  },
};
