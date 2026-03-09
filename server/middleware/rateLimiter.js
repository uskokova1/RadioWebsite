import rateLimit from 'express-rate-limit'

export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes', // Custom message when limit is exceeded
    standardHeaders: true,
    legacyHeaders: false,
})

export const loginRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests login attempts from this IP, please try again after 5 minutes', // Custom message when limit is exceeded
    standardHeaders: true,
    legacyHeaders: false,
})

export const emailRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests email attempts from this IP, please try again after 5 minutes', // Custom message when limit is exceeded
    standardHeaders: true,
    legacyHeaders: false,
})
