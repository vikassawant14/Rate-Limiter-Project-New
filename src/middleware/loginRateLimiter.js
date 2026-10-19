import redisClient from "../config/redis.js";

const WINDOW = Number(process.env.LOGIN_RATE_LIMIT_WINDOW);
const MAX_REQUESTS = Number(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS);

const loginRateLimiter = async (req, res, next) => {

    const ip = req.ip;

    const key = `login_rate_limit:${ip}`;

    const requestCount = await redisClient.incr(key);

    if (requestCount === 1) {
        await redisClient.expire(key, WINDOW);
    }

    const remaining = Math.max(
        0,
        MAX_REQUESTS - requestCount
    );

    res.setHeader(
        "X-Login-RateLimit-Limit",
        MAX_REQUESTS
    );

    res.setHeader(
        "X-Login-RateLimit-Remaining",
        remaining
    );

    if (requestCount > MAX_REQUESTS) {

        const ttl = await redisClient.ttl(key);

        res.setHeader("Retry-After", ttl);

        return res.status(429).json({
            error: "Too Many Login Attempts",
            message: "Please try again later",
            retryAfter: ttl
        });
    }

    next();
};

export default loginRateLimiter;