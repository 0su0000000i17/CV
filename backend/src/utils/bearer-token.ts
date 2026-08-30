export function parseBearerToken(header: unknown) {
  if (typeof header !== "string") return null;

  const match = /^Bearer[\t ]+(\S{16,8192})[\t ]*$/iu.exec(header);
  return match?.[1] ?? null;
}
