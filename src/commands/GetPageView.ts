import { PageViewEvent, MetadataBearer } from "./types";
import { deserializeMetadata, verifyPageViewEvent } from "./constants";

export const listItems = async (payload: { prefix: string }, env: Env) => {
  const { prefix } = payload;
  const { list_complete, keys, cacheStatus } = await env.VISITOR_COUNT_DB.list({ prefix });
  return { list_complete, keys, cacheStatus };
};

export interface GetPageViewEventInput {
  postId: string;
  cacheTtl?: number;
}

export interface GetPageViewEventOutput extends MetadataBearer, Partial<PageViewEvent> {}

export const getPageView = async (input: GetPageViewEventInput, env: Env): Promise<GetPageViewEventOutput> => {
  const key = `view:${input.postId}`;
  const { value, metadata, cacheStatus } = await env.VISITOR_COUNT_DB.getWithMetadata(key, {
    type: "text",
    ...(input.cacheTtl && { cacheTtl: input.cacheTtl }),
  });

  const data = JSON.parse(value || "{}");
  const content: Partial<PageViewEvent> = verifyPageViewEvent(data) ? data : {};

  return {
    $metadata: {
      code: 200,
      ...deserializeMetadata(metadata),
      ...(cacheStatus && { cacheStatus }),
    },
    postId: content.postId || undefined,
    count: content.count || undefined,
    lastUpdate: content.lastUpdate || undefined,
  };
};
