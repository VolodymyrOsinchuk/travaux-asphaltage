// middleware/cors.js
const cors = require('cors')

// Liste des origines autorisées
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  'https://travaux-asphaltage.onrender.com',
  'https://travaux-asphaltage.netlify.app',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : []),
]

// Configuration CORS de base
const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (applications mobiles, Postman, etc.)
    if (!origin) return callback(null, true)

    // En développement, autoriser localhost avec n'importe quel port
    if (
      process.env.NODE_ENV === 'development' &&
      origin.startsWith('http://localhost:')
    ) {
      return callback(null, true)
    }

    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    // Rejeter l'origine
    return callback(new Error('Non autorisé par CORS'), false)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Forwarded-For',
    'X-Real-IP',
    'User-Agent',
    'X-CSRF-Token',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'Link',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true, // Autoriser les cookies
  maxAge: 86400, // Cache preflight pendant 24h
  optionsSuccessStatus: 200, // Pour les anciens navigateurs
}

// CORS strict pour les API sensibles
const strictCorsOptions = {
  origin: (origin, callback) => {
    // En production, être très strict
    if (process.env.NODE_ENV === 'production') {
      const productionOrigins = allowedOrigins.filter((o) =>
        o.startsWith('https://')
      )
      if (!origin || !productionOrigins.includes(origin)) {
        return callback(new Error('Non autorisé par CORS'), false)
      }
    }

    // En développement, autoriser localhost uniquement
    if (process.env.NODE_ENV === 'development') {
      if (!origin || origin.startsWith('http://localhost:')) {
        return callback(null, true)
      }
      return callback(new Error('Non autorisé par CORS'), false)
    }

    callback(null, true)
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 3600, // Cache preflight pendant 1h seulement
  optionsSuccessStatus: 200,
}

// CORS permissif pour les ressources publiques
const publicCorsOptions = {
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Cache-Control',
  ],
  credentials: false,
  maxAge: 86400,
}

// Middleware CORS avec logging
const corsWithLogging = (options = corsOptions) => {
  return (req, res, next) => {
    const corsMiddleware = cors(options)

    // Log des requêtes CORS pour le debugging
    if (process.env.NODE_ENV === 'development' && req.headers.origin) {
      console.log(`[CORS] ${req.method} ${req.path} from ${req.headers.origin}`)
    }

    corsMiddleware(req, res, (err) => {
      if (err) {
        console.error(
          `[CORS] Erreur: ${err.message} pour ${req.headers.origin}`
        )
        return res.status(403).json({
          error: 'Accès interdit par CORS',
          message: err.message,
          origin: req.headers.origin,
        })
      }
      next()
    })
  }
}

// Middleware CORS conditionnel basé sur la route
const conditionalCors = (req, res, next) => {
  // API sensibles (admin, auth, etc.)
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
    return corsWithLogging(strictCorsOptions)(req, res, next)
  }

  // Ressources publiques (images, documents, etc.)
  if (req.path.startsWith('/public') || req.path.startsWith('/uploads')) {
    return corsWithLogging(publicCorsOptions)(req, res, next)
  }

  // Autres routes avec CORS standard
  return corsWithLogging(corsOptions)(req, res, next)
}

module.exports = {
  corsOptions,
  strictCorsOptions,
  publicCorsOptions,
  corsWithLogging,
  conditionalCors,
  allowedOrigins,
}
