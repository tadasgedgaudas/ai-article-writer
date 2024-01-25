import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { swagger } from "@elysiajs/swagger";
import { articleController } from "./controllers/article";
import { tasksController } from "./controllers/tasks";

const API_V1 = "/api/v1";

const app = new Elysia()
  .use(swagger())
  .use(html())
  .group(API_V1, (app: Elysia) =>
    app.use(articleController).use(tasksController),
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
