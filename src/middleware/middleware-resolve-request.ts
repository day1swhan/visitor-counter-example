export interface ResolvedRequest {
  method: string;
  hostname: string;
  path: string;
  query: { [x: string]: string | undefined };
  headers: { [x: string]: string };
  body?: string;
  isJson: boolean; // custom
}

export const middlewareResolveRequest = async (request: Request): Promise<ResolvedRequest> => {
  const { method, headers, url } = request;
  const { hostname, pathname, searchParams } = new URL(url);

  const resolvedHeaders: ResolvedRequest["headers"] = {};
  for (const entry of headers.entries()) {
    const [key, value] = entry;
    resolvedHeaders[key.toLowerCase()] = value;
  }

  const resolvedQuery: ResolvedRequest["query"] = {};
  for (const entry of searchParams.entries()) {
    const [key, value] = entry;
    resolvedQuery[key] = value;
  }

  let body = "";
  let isJson = false;
  if (method == "POST") {
    const contentType = resolvedHeaders["content-type"] || "";
    if (contentType.includes("application/json")) {
      try {
        body = JSON.stringify(await request.json());
      } catch (e) {
        body = JSON.stringify({});
      } finally {
        isJson = true;
      }
    } else if (contentType.includes("application/text")) {
      body = await request.text();
    } else if (contentType.includes("text/html")) {
      body = await request.text();
    } else if (contentType.includes("form")) {
      const formData = await request.formData();
      const payload: Record<string, string> = {};
      for (const entry of formData.entries()) {
        payload[entry[0]] = entry[1] as string;
      }
      body = JSON.stringify(payload);
      isJson = true;
    }
  }

  return {
    method: method,
    hostname: hostname,
    path: pathname,
    query: resolvedQuery,
    headers: resolvedHeaders,
    ...(body && { body }),
    isJson: isJson,
  };
};
