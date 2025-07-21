import { MetadataBearer, SessionIdEvent } from "./types";
import { deserializeMetadata, verifySessionId } from "./constants";

export interface GetSessionIdInput {
  sessionId: string;
  ttl?: number;
}

export interface GetSessionIdOutput extends MetadataBearer, Partial<SessionIdEvent> {
  isValid?: boolean;
}

export const getSessionId = async (input: GetSessionIdInput, env: Env): Promise<GetSessionIdOutput> => {
  const { value, metadata, cacheStatus } = await env.VISITOR_COUNT_DB.getWithMetadata(input.sessionId, {
    type: "text",
    ...(input.ttl && { cacheTtl: input.ttl }),
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
    isValid: content.sessionId ? true : false,
  };
};
