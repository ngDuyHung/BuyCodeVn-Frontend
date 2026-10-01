const UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";

const createFallbackUuid = () =>
  UUID_V4_TEMPLATE.replace(/[018]/g, (character) => {
    const value = Number(character);
    const randomByte = new Uint8Array(1);

    if (typeof globalThis.crypto?.getRandomValues === "function") {
      globalThis.crypto.getRandomValues(randomByte);
    } else {
      randomByte[0] = Math.floor(Math.random() * 256);
    }

    return (value ^ (randomByte[0] & (15 >> (value / 4)))).toString(16);
  });

export const createIdempotencyKey = (operation: string, resourceId: number) => {
  // Keep the existing call signature while the backend now requires a plain UUID.
  void operation;
  void resourceId;

  return typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : createFallbackUuid();
};
