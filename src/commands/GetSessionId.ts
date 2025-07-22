import { MetadataBearer, SessionIdEvent } from "./types";
import { deserializeMetadata, verifySessionId } from "./constants";

export interface GetSessionIdInput {
  sessionId: string;
  postId: string;
  cacheTtl?: number;
}

export interface GetSessionIdOutput extends MetadataBearer, Partial<SessionIdEvent> {}

export const getSessionId = async (input: GetSessionIdInput, env: Env): Promise<GetSessionIdOutput> => {
  const { sessionId, postId, cacheTtl } = input;

  const key = `visit:${sessionId}:${postId}`;
  const { value, metadata, cacheStatus } = await env.VISITOR_COUNT_DB.getWithMetadata(key, {
    type: "text",
    ...(cacheTtl && { cacheTtl }),
  });

  const data = JSON.parse(value || "{}");
  const content: Partial<SessionIdEvent> = verifySessionId(data) ? data : {};

  return {
    $metadata: {
      code: 200,
      ...deserializeMetadata(metadata),
      ...(cacheStatus && { cacheStatus }),
    },
    sessionId: content.sessionId || undefined,
    postId: content.postId || undefined,
  };
};
