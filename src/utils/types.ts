export interface HttpRequest extends Endpoint, HttpMessage {
  method: string;
}

export interface Endpoint {
  hostname: string;
  path: string;
  query: {
    [x: string]: string | undefined;
  };
}

export interface HttpMessage {
  headers: {
    [x: string]: string | undefined;
  };
  body?: string;
  isJson: boolean;
}

export type Cookie = {
  [x: string]: string | undefined;
};
