import redisClient from "../config/redis.js";

const WINDOW = Number(process.env.RATE_LIMIT_WINDOW);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS);

const rateLimiter = async (req, res, next) => {

    const ip = req.ip;

    const key = `rate_limit:${ip}`;

    const requestCount = await redisClient.incr(key);

    // Start 60-second expiry on the first request
    if (requestCount === 1) {
        await redisClient.expire(key, WINDOW);
    }

    const remaining = Math.max(
        0,
        MAX_REQUESTS - requestCount
    );

    res.setHeader(
        "X-RateLimit-Limit",
        MAX_REQUESTS
    );

    res.setHeader(
        "X-RateLimit-Remaining",
        remaining
    );

    // Limit exceeded
    if (requestCount > MAX_REQUESTS) {

        const ttl = await redisClient.ttl(key);

        res.setHeader(
            "Retry-After",
            ttl > 0 ? ttl : WINDOW
        );

        return res.status(429).json({
            error: "Too Many Requests",
            message: "Rate limit exceeded",
            retryAfter: ttl > 0 ? ttl : WINDOW
        });
    }

    next();
};

export default rateLimiter;