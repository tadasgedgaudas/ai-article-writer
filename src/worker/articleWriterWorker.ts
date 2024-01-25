import { Worker, Job } from "bullmq";
import { config } from "../config";
import { writeArticle } from "../lib/services/articleWriter";
import { ArticleData } from "../lib/db/schemas";

const queueName = "writerBoiTasks";
console.log("Starting worker...");
console.log("Waiting for tasks...");

const worker = new Worker(
  queueName,
  async (job: Job) => {
    const jobData = JSON.parse(job.data);

    const articleData: ArticleData = {
      website: jobData.website,
      niche: jobData.niche,
      keyword: jobData.keyword,
      taskId: jobData.taskId,
    };
    const article = await writeArticle(articleData);
    console.log("Finished writing article", article.article?.split("\n")[0]);
  },
  {
    connection: { host: config.db.redis, port: config.db.redisPort },
    concurrency: 5,
  },
);

worker.on("completed", (job: Job) => {
  console.log(`Job completed with result ${job.returnvalue}`);
});

worker.on("failed", (job: Job, error: Error) => {
  console.error(`Job ${job.id} failed with ${error}`);
});
