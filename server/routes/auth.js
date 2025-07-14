// routes/auth.js - Routes authentification
const express = require('express')
const router = express.Router()
const { body, param } = require('express-validator')
const rateLimit = require('express-rate-limit')

const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController')

const {
  authenticateToken,
  requireEmailVerified,
  rateLimitByUser,
} = require('../middleware/auth')

// Rate limiting pour les routes sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    message: 'Trop de tentatives. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives par IP
  message: {
    success: false,
    message: 'Trop de tentatives de réinitialisation. Réessayez dans 1 heure.',
  },
})

// Validations
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage("Le nom d'utilisateur doit contenir entre 3 et 30 caractères")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
    ),

  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),

  body('firstName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage(
      'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),

  body('lastName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage(
      'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),

  body('role')
    .optional()
    .isIn(['admin', 'user', 'moderator'])
    .withMessage('Rôle invalide'),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),

  body('password').notEmpty().withMessage('Mot de passe requis'),
]

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
]

const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Le nom d'utilisateur doit contenir entre 3 et 30 caractères")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
    ),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),

  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage(
      'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s-']+$/)
    .withMessage(
      'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),
]

const emailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
]

const resetPasswordValidation = [
  param('token').isLength({ min: 32, max: 64 }).withMessage('Token invalide'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
]

const tokenValidation = [
  param('token').isLength({ min: 32, max: 64 }).withMessage('Token invalide'),
]

// Routes publiques
router.post('/register', authLimiter, registerValidation, register)
router.post('/login', authLimiter, loginValidation, login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)
router.post(
  '/forgot-password',
  passwordLimiter,
  emailValidation,
  forgotPassword
)
router.post(
  '/reset-password/:token',
  passwordLimiter,
  resetPasswordValidation,
  resetPassword
)
router.get('/verify-email/:token', tokenValidation, verifyEmail)
router.post(
  '/resend-verification',
  authLimiter,
  emailValidation,
  resendVerification
)

// Routes protégées
router.post(
  '/change-password',
  authenticateToken,
  requireEmailVerified,
  rateLimitByUser(5, 60 * 60 * 1000), // 5 changements par heure
  changePasswordValidation,
  changePassword
)

router.get('/profile', authenticateToken, getUserProfile)

router.put(
  '/profile',
  authenticateToken,
  requireEmailVerified,
  updateProfileValidation,
  updateUserProfile
)

// Route pour vérifier le statut de l'authentification
router.get('/status', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      isAuthenticated: true,
      user: req.user,
    },
  })
})

// Route pour obtenir les informations de session
router.get('/session', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      loginTime: req.user.lastLogin,
      tokenExpiry: req.user.tokenExpiry, // Si vous stockez cette info
    },
  })
})

module.exports = router
