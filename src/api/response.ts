export const badRequest = () => {
  const code = 400;
  const message = "Bad Request";
  return Response.json({ err: { code, message } }, { status: code });
};

export const forbidden = () => {
  const code = 403;
  const message = "Forbidden";
  return Response.json({ err: { code, message } }, { status: code });
};

export const notFound = () => {
  const code = 404;
  const message = "NotFound";
  return Response.json({ err: { code, message } }, { status: code });
};
