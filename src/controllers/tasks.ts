import { Elysia, t } from "elysia";

import { createWritingTask } from "../lib/services/taskCreator";

export const tasksController = (app: Elysia) =>
  app.group("/tasks", (app: Elysia) =>
    app.guard(
      {
        body: t.Object({
          keyword: t.String(),
          niche: t.String(),
          website: t.String(),
        }),
      },
      (app: Elysia) =>
        app.post("/create", async (handler: Elysia.Handler) => {
          const keyword = handler.body.keyword;
          const niche = handler.body.niche;
          const website = handler.body.website;

          const task = await createWritingTask(website, keyword, niche);

          return {
            data: {
              task,
            },
          };
        }),
    ),
  );
