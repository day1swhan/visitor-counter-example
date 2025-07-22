import { resolveRequest, parseCookie, verifyOrigin, generateCorsHeaders } from "./utils";
import { getPageView, getSessionId, putPageView, putSessionId, PageViewEvent } from "./commands";
import { notFound, badRequest } from "./api/response";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { method, hostname, path, query, headers, body, isJson } = await resolveRequest(request);
    const routeKey = method + " " + path;
    const cookie = parseCookie(headers["cookie"] || "");
    const origin = headers["origin"] || "";

    if (!verifyOrigin(origin)) {
      return badRequest("Not Allowd Origin");
    }

    switch (routeKey) {
      case "OPTIONS /count": {
        return new Response(null, {
          status: 204,
          headers: generateCorsHeaders(origin),
        });
      }

      case "POST /count": {
        if (!isJson || !body) {
          return badRequest("Invalid Request");
        }

        const { postId } = JSON.parse(body);

        if (!postId) {
          return badRequest("Invalid Request Payload");
        }

        const headers: Record<string, string> = generateCorsHeaders(origin);
        const content = { ok: true };

        const sid = cookie["sid"] || crypto.randomUUID().replace(/\-/g, "");
        const { sessionId } = await getSessionId({ sessionId: sid, postId }, env);

        if (!sessionId) {
          const { count } = await getPageView({ postId }, env);

          await putPageView({ postId, count: Number(count || 0) + 1 }, env);
          await putSessionId({ sessionId: sid, postId, expirationTtl: 86400 }, env);

          headers["Set-Cookie"] = `sid=${sid}; Domain=${hostname}; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict;`;
        }

        return Response.json(content, {
          status: 200,
          headers: headers,
        });
      }

      case "GET /view": {
        const postId = query["id"];

        if (!postId) {
          return badRequest("Invalid Request Payload");
        }

        const output = await getPageView({ postId: postId }, env);

        const headers: Record<string, string> = generateCorsHeaders(origin);
        const content: Partial<PageViewEvent> = {
          postId: output.postId,
          count: output.count,
          lastUpdate: output.lastUpdate,
        };

        return Response.json(content, { status: 200, headers: headers });
      }

      default: {
        return notFound();
      }
    }
  },
} satisfies ExportedHandler<Env>;
