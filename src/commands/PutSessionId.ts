import { MetadataBearer, SessionIdEvent } from "./types";

export interface PutSessionIdInput {
  sessionId: string;
  metadata?: Record<string, string | number>;
  expirationTtl?: number;
}

export interface PutSessionIdOutput extends MetadataBearer, Partial<SessionIdEvent> {}

export const putSessionId = async (input: PutSessionIdInput, env: Env): Promise<PutSessionIdOutput> => {
  const { sessionId, metadata, expirationTtl } = input;
  const payload: SessionIdEvent = { sessionId };

  await env.VISITOR_COUNT_DB.put(sessionId, JSON.stringify(payload), {
    ...(metadata && { metadata }),
    ...(expirationTtl && { expirationTtl }),
  });

  return {
    $metadata: {
      code: 200,
    },
    sessionId: sessionId,
  };
};
