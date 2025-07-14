// middleware/auth.js
const jwt = require('jsonwebtoken')
const { User } = require('../models')

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'accès requis",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      })
    }
    console.error("Erreur d'authentification:", error)
    return res.status(500).json({
      success: false,
      message: "Erreur d'authentification",
    })
  }
}

// Middleware pour vérifier les rôles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      })
    }

    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.role]

    const hasRequiredRole = roles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        required: roles,
        current: userRoles,
      })
    }

    next()
  }
}

// Middleware pour vérifier les permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise',
      })
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' requise`,
        required: permission,
        current: req.user.permissions || [],
      })
    }

    next()
  }
}

// Middleware pour vérifier l'email vérifié
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise',
    })
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message:
        'Email non vérifié. Veuillez vérifier votre email avant de continuer.',
    })
  }

  next()
}

// Middleware optionnel (n'échoue pas si pas de token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.token

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] },
      })

      if (user && user.isActive) {
        req.user = user
      }
    }
    next()
  } catch (error) {
    // Ignorer les erreurs et continuer sans utilisateur
    next()
  }
}

// Middleware pour limiter le taux de requêtes par utilisateur
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map()

  return (req, res, next) => {
    const userId = req.user?.id || req.ip

    const now = Date.now()
    const userRequestData = userRequests.get(userId) || {
      count: 0,
      resetTime: now + windowMs,
    }

    if (now > userRequestData.resetTime) {
      userRequestData.count = 0
      userRequestData.resetTime = now + windowMs
    }

    if (userRequestData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Trop de requêtes. Veuillez réessayer plus tard.',
        resetTime: userRequestData.resetTime,
      })
    }

    userRequestData.count++
    userRequests.set(userId, userRequestData)

    next()
  }
}
// Middleware pour vérifier la propriété d'un article
const checkPostOwnership = async (req, res, next) => {
  try {
    const { id } = req.params
    const { Blog } = require('../models')

    const post = await Blog.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    // Admin peut tout faire
    if (req.user.role === 'admin') {
      return next()
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas les droits pour modifier cet article",
      })
    }

    next()
  } catch (error) {
    console.error('Erreur lors de la vérification des droits:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    })
  }
}

module.exports = {
  authenticateToken,
  checkPostOwnership,
  optionalAuth,
  rateLimitByUser,
  requireEmailVerified,
  requirePermission,
  requireRole,
}
