import { MetadataBearer, PageViewEvent } from "./types";

export interface PutPageViewInput {
  postId: string;
  count: number;
  metadata?: Record<string, string | number>;
  expirationTtl?: number;
}

export interface PutPageViewOutput extends MetadataBearer, Partial<PageViewEvent> {}

export const putPageView = async (input: PutPageViewInput, env: Env): Promise<PutPageViewOutput> => {
  const { postId, count, metadata, expirationTtl } = input;

  const key = `view:${postId}`;
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const payload: PageViewEvent = {
    postId,
    count,
    lastUpdate: iso,
  };

  await env.VISITOR_COUNT_DB.put(key, JSON.stringify(payload), {
    ...(metadata && { metadata }),
    ...(expirationTtl && { expirationTtl }),
  });

  return {
    $metadata: {
      code: 200,
    },
    postId: postId,
    count: count,
    lastUpdate: iso,
  };
};
