import { PageViewEvent, SessionIdEvent } from "./types";

export const deserializeMetadata = (input: any): Record<string, string | number> => {
  if (input && typeof input === "object" && !!Object.keys(input).length) {
    const output: Record<string, string | number> = {};

    for (const [key, value = null] of Object.entries(input)) {
      if (typeof value == "string" || typeof value == "number") {
        output[key] = value;
      }
    }

    return output;
  }
  return {};
};

export const verifyPageViewEvent = (input: any): input is PageViewEvent => {
  return (
    typeof input === "object" &&
    "postId" in input &&
    "count" in input &&
    "lastUpdate" in input &&
    typeof (input as any).postId === "string" &&
    typeof (input as any).count === "number" &&
    typeof (input as any).lastUpdate == "string"
  );
};

export const verifySessionId = (input: any): input is SessionIdEvent => {
  return typeof input == "object" && "sessionId" in input && typeof (input as any).sessionId === "string";
};
