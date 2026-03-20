const rateLimitMaps = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function createRateLimiter(namespace: string, maxRequests: number = 10, windowMs: number = 60_000) {
  if (!rateLimitMaps.has(namespace)) {
    rateLimitMaps.set(namespace, new Map());
  }
  const map = rateLimitMaps.get(namespace)!;

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = map.get(key);
    if (!entry || now > entry.resetAt) {
      map.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count++;
    return entry.count > maxRequests;
  };
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}