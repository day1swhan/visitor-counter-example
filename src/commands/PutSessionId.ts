import { MetadataBearer, SessionIdEvent } from "./types";

export interface PutSessionIdInput {
  sessionId: string;
  postId: string;
  metadata?: Record<string, string | number>;
  expirationTtl?: number;
}

export interface PutSessionIdOutput extends MetadataBearer, Partial<SessionIdEvent> {}

export const putSessionId = async (input: PutSessionIdInput, env: Env): Promise<PutSessionIdOutput> => {
  const { sessionId, postId, metadata, expirationTtl } = input;

  const key = `visit:${sessionId}:${postId}`;
  const payload: SessionIdEvent = { sessionId, postId };

  await env.VISITOR_COUNT_DB.put(key, JSON.stringify(payload), {
    ...(metadata && { metadata }),
    expirationTtl: expirationTtl ? expirationTtl : 86400,
  });

  return {
    $metadata: {
      code: 200,
    },
    sessionId: sessionId,
    postId: postId,
  };
};
