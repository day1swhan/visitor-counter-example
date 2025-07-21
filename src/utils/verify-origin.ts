import { ALLOWED_ORIGINS } from "../constants";

export const verifyOrigin = (origin: string): boolean => {
  return ALLOWED_ORIGINS.includes(origin);
};
