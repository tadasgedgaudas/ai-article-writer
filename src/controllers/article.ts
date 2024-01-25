import { Elysia } from "elysia";
import { dbGetter } from "../lib/db/getter";
import buildArticleKey from "../lib/services/utils";

export const articleController = (app: Elysia) =>
  app.group("/article", (app: Elysia) =>
    app.get("/articles", async (handler: Elysia.Handler) => {
      const cursor = handler.query.cursor || 0;
      const website = handler.query.website;

      const data = await dbGetter.get(buildArticleKey(website), cursor, 10);
      const articles = data.results;
      const nextCursor = data.nextCursor;

      return { data: { articles, nextCursor } };
    }),
  );
