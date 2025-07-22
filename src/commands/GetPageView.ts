import { PageViewEvent, MetadataBearer } from "./types";
import { deserializeMetadata, verifyPageViewEvent } from "./constants";

export interface GetPageViewEventInput {
  postId: string;
  cacheTtl?: number;
}

export interface GetPageViewEventOutput extends MetadataBearer, Partial<PageViewEvent> {}

export const getPageView = async (input: GetPageViewEventInput, env: Env): Promise<GetPageViewEventOutput> => {
  const { postId, cacheTtl } = input;

  const key = `view:${postId}`;
  const { value, metadata, cacheStatus } = await env.VISITOR_COUNT_DB.getWithMetadata(key, {
    type: "text",
    ...(cacheTtl && { cacheTtl }),
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
