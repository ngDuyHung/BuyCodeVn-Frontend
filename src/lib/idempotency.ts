export const createIdempotencyKey = (operation: string, resourceId: number) => {
  const randomPart =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${operation}:${resourceId}:${randomPart}`;
};
