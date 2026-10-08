/**
 * Monkey-patches BigInt.prototype.toJSON so that any JSON.stringify invocation
 * (Express res.json, loggers, exception filters) safely serializes BigInt values as strings
 * instead of throwing "TypeError: Do not know how to serialize a BigInt".
 */
export function registerBigIntSerialization(): void {
  if (!("toJSON" in BigInt.prototype)) {
    Object.defineProperty(BigInt.prototype, "toJSON", {
      value: function (this: bigint): string {
        return this.toString();
      },
      writable: true,
      configurable: true,
    });
  }
}

// Auto-register on module load
registerBigIntSerialization();

/**
 * Deeply transforms any BigInt values into strings across nested objects and arrays,
 * preventing serialization crashes and ensuring wire types match standard string contracts.
 */
export function serializeBigInt<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || value === undefined) return value;
  if (typeof value === "bigint") return value.toString() as unknown as T;
  if (typeof value !== "object") return value;
  if (value instanceof Date || value instanceof RegExp) return value;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) return value;

  if (seen.has(value)) {
    return value;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => serializeBigInt(item, seen)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = serializeBigInt(val, seen);
  }
  return result as T;
}
