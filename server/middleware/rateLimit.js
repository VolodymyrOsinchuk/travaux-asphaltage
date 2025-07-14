// middleware/rateLimit.js
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')

// IPs de confiance
const trustedIPs = (process.env.TRUSTED_IPS || '')
  .split(',')
  .filter((ip) => ip.trim())

// Fonction pour bypasser le rate limiting pour certains IPs
const skipTrustedIPs = (req, res, next) => {
  if (trustedIPs.includes(req.ip)) {
    return next()
  }
  return false
}

// Middleware pour log des requêtes limitées
const logRateLimitHit = (req, res, next) => {
  const originalHandler = req.rateLimit?.handler
  if (originalHandler) {
    console.warn(
      `Rate limit hit for IP ${req.ip} on ${req.method} ${req.originalUrl}`
    )
  }
  next()
}

// Rate limiter général
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  skip: skipTrustedIPs,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    })
  },
})

// Rate limiter strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    success: false,
    error:
      'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':auth',
  skipSuccessfulRequests: true,
  skip: skipTrustedIPs,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error:
        'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    })
  },
})

// Rate limiter pour les requêtes de lecture publique
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Plus permissif pour la lecture
  message: {
    success: false,
    error: 'Trop de requêtes de lecture, veuillez réessayer plus tard.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':read',
  skip: skipTrustedIPs,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes de lecture, veuillez réessayer plus tard.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    })
  },
})

// Rate limiter strict pour les opérations sensibles
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requêtes max
  message: {
    success: false,
    error:
      'Trop de requêtes pour cette opération, veuillez réessayer plus tard.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':strict',
  skip: skipTrustedIPs,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error:
        'Trop de requêtes pour cette opération, veuillez réessayer plus tard.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    })
  },
})

// Rate limiter pour les uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads par fenêtre
  message: {
    success: false,
    error: "Trop de tentatives d'upload. Réessayez dans 15 minutes.",
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':upload',
  skip: skipTrustedIPs,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Trop de tentatives d'upload. Réessayez dans 15 minutes.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    })
  },
})

// Rate limiter pour les opérations lourdes
const heavyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requêtes max
  message: {
    success: false,
    error: 'Trop de requêtes lourdes, veuillez réessayer plus tard.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ':heavy',
  skip: skipTrustedIPs,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes lourdes, veuillez réessayer plus tard.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    })
  },
})

// Middleware pour ralentir les requêtes progressivement
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Commencer à ralentir après 50 requêtes
  delayMs: false, // Délai initial de 500ms
  maxDelayMs: 20000, // Délai maximum de 20 secondes
  keyGenerator: (req) => req.ip,
  skip: skipTrustedIPs,
})

module.exports = {
  generalLimiter,
  authLimiter,
  readLimiter,
  strictLimiter,
  uploadLimiter,
  heavyLimiter,
  speedLimiter,
  logRateLimitHit,
}
