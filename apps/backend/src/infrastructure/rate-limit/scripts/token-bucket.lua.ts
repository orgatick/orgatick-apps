/**
 * Atomic Token Bucket Rate Limiter Lua Script for Redis.
 *
 * KEYS[1]: Rate limit Redis key (e.g. rate_limit:login:ip:103.45.12.4)
 * ARGV[1]: Bucket capacity (max burst size, e.g. 5)
 * ARGV[2]: Refill rate per millisecond (e.g. capacity / (windowSeconds * 1000))
 * ARGV[3]: Tokens requested for this action (default: 1)
 * ARGV[4]: Key TTL in seconds (time until inactive bucket is pruned)
 *
 * Returns:
 * [1] allowed: 1 if request is permitted, 0 if rate limit exceeded
 * [2] remaining: number of tokens left in bucket (floored integer)
 * [3] retry_after_seconds: seconds until enough tokens refill for requested amount (0 if allowed)
 * [4] reset_after_seconds: seconds until bucket is fully restored to maximum capacity
 */

export const TOKEN_BUCKET_LUA_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate_per_ms = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

-- Use Redis server clock to guarantee clock synchronization across all backend nodes
local redis_time = redis.call('TIME')
local now_ms = (tonumber(redis_time[1]) * 1000) + math.floor(tonumber(redis_time[2]) / 1000)

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local current_tokens = capacity
local last_updated = now_ms

if data[1] and data[2] then
    local stored_tokens = tonumber(data[1])
    local stored_last_updated = tonumber(data[2])

    if stored_tokens ~= nil and stored_last_updated ~= nil then
        local elapsed = math.max(0, now_ms - stored_last_updated)
        local generated_tokens = elapsed * refill_rate_per_ms
        current_tokens = math.min(capacity, stored_tokens + generated_tokens)
        last_updated = now_ms
    end
end

local allowed = 0
local remaining = current_tokens
local retry_after = 0
local reset_after = 0

if current_tokens >= requested then
    allowed = 1
    remaining = current_tokens - requested
    redis.call('HMSET', key, 'tokens', tostring(remaining), 'last_updated', tostring(now_ms))
    redis.call('EXPIRE', key, ttl)
else
    allowed = 0
    local deficit = requested - current_tokens
    if refill_rate_per_ms > 0 then
        retry_after = math.ceil(deficit / (refill_rate_per_ms * 1000))
    else
        retry_after = ttl
    end
    -- Still refresh expiration to maintain rate-limiting window under sustained attack
    redis.call('EXPIRE', key, ttl)
end

if refill_rate_per_ms > 0 then
    local missing_to_full = capacity - remaining
    reset_after = math.max(0, math.ceil(missing_to_full / (refill_rate_per_ms * 1000)))
else
    reset_after = ttl
end

return { allowed, math.max(0, math.floor(remaining)), retry_after, reset_after }
`;
