import { Cookie } from "./types";

export const parseCookie = (input: string): Cookie => {
  const rawCookie = input.replace(/;/g, "").split(" ").sort();

  const resolvedCookie: Cookie = {};
  for (const cookie of rawCookie) {
    const [key, value = null] = cookie.split("=");
    if (value) {
      resolvedCookie[key] = value;
    }
  }
  return resolvedCookie;
};
