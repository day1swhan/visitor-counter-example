import { middlewareResolveRequest } from "./middleware/middleware-resolve-request";
import { notFound, badRequest } from "./api/response";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

        // view 이벤트에 사용할 key
        const key = `view:${postId}`;

        // 기존 카운팅 정보 가져오기
        const before = await env.VISITOR_COUNT_DB.get(key);

        // 요청 들어왔으니 +1 해주고
        const count = Number(before || 0) + 1;

        // 언제 업데이트 된건지 응답 정보에 넘겨주기 (선택)
        const lastUpdate = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

        // 최신 카운팅 정보로 덮어쓰기
        await env.VISITOR_COUNT_DB.put(key, String(count));

        return Response.json({ postId, count, lastUpdate });
      }

      default: {
        return notFound();
      }
    }
  },
} satisfies ExportedHandler<Env>;
