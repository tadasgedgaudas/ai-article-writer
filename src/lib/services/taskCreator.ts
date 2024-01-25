import * as crypto from "crypto";

import { Task } from "../db/schemas";
import { taskQueue } from "../queue/queue";

export async function createWritingTask(
  website: string,
  keyword: string,
  niche: string,
) {
  const taskId = crypto.randomUUID();

  const task: Task = {
    taskId,
    website,
    niche,
    keyword,
  };

  console.log("Creating task! ", website, keyword, niche);
  await taskQueue.add("WritingTasks", JSON.stringify(task));
  return task;
}
