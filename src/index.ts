import { middlewareResolveRequest } from "./middleware/middleware-resolve-request";
import { notFound, badRequest } from "./api/response";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const { method, path, query } = await middlewareResolveRequest(request);
    const routeKey = method + " " + path;

    switch (routeKey) {
      case "GET /": {
        return new Response("Hello visitor-counter-example!");
      }

      case "GET /view": {
        const postId = query["id"];

        if (!postId) {
          return badRequest();
        }

        const key = `view:${postId}`;
        const before = await env.VISITOR_COUNT_DB.get(key);

        const count = Number(before || 0) + 1;
        const lastUpdate = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

        await env.VISITOR_COUNT_DB.put(key, String(count));

        return Response.json({ postId, count, lastUpdate });
      }

      default: {
        return notFound();
      }
    }
  },
} satisfies ExportedHandler<Env>;
