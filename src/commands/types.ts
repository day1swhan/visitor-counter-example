export type MetadataBearer = {
  $metadata: ResponseMetadata & CloudflareKVMetadata;
};

export type ResponseMetadata = { code: number } & Record<string, string | number>;

export type CloudflareKVMetadata = {
  cacheStatus?: string;
};

export type PageViewEvent = {
  postId: string;
  count: number;
  lastUpdate: string;
};

export type SessionIdEvent = {
  sessionId: string;
  postId: string;
};
