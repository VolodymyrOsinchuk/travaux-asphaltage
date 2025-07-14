const express = require('express')
const router = express.Router()
const { body, param, query } = require('express-validator')
const { Op } = require('sequelize') // Import Op for bulk operations
const rateLimit = require('express-rate-limit')

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
  getUserStats,
  searchUsers,
  getUsersByRole,
} = require('../controllers/userController')

const { User } = require('../models') // Import User model for bulk operations

const {
  authenticateToken,
  requireRole,
  requirePermission,
  rateLimitByUser, // Although not used in this specific file, good to keep for context if needed elsewhere
} = require('../middleware/auth')

// Rate limiting pour les opérations sensibles
const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 actions par IP
  message: {
    success: false,
    message: "Trop d'actions administratives. Réessayez dans 15 minutes.",
  },
})

// Middleware pour vérifier les permissions admin
const requireAdmin = [authenticateToken, requireRole(['admin'])] // Ensure admin role is an array
const requireAdminOrModerator = [
  authenticateToken,
  requireRole(['admin', 'moderator']),
]

// Validations
const createUserValidation = [
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

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),

  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date de naissance invalide'),

  body('timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Fuseau horaire invalide'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Code langue invalide'),
]

const updateUserValidation = [
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

  body('role')
    .optional()
    .isIn(['admin', 'user', 'moderator'])
    .withMessage('Rôle invalide'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),

  body('phoneNumber')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date de naissance invalide'),

  body('timezone')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Fuseau horaire invalide'),

  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Code langue invalide'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Les permissions doivent être un tableau'),
]

const resetPasswordValidation = [
  body('newPassword')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),

  body('sendEmail')
    .optional()
    .isBoolean()
    .withMessage('sendEmail doit être un booléen'),
]
const toggleStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive doit être un booléen'),
]

const uuidValidation = [
  param('id').isUUID().withMessage('ID utilisateur invalide'),
]

const roleValidation = [
  param('role')
    .isIn(['admin', 'user', 'moderator'])
    .withMessage('Rôle invalide'),
]

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
]

const searchValidation = [
  query('q')
    .isLength({ min: 2, max: 100 })
    .withMessage('La recherche doit contenir entre 2 et 100 caractères'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50'),
]

// Validation pour les opérations en masse
const bulkUserIdsValidation = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds doit être un tableau non vide'),
  body('userIds.*').isUUID().withMessage('Chaque ID doit être un UUID valide'),
]

// Routes pour la gestion des utilisateurs

// Obtenir tous les utilisateurs (avec pagination et filtres)
router.get('/', requireAdminOrModerator, paginationValidation, getAllUsers)

// Obtenir les statistiques des utilisateurs
router.get('/stats', requireAdmin, getUserStats)

// Rechercher des utilisateurs
router.get('/search', requireAdminOrModerator, searchValidation, searchUsers)

// Obtenir les utilisateurs par rôle
router.get(
  '/role/:role',
  requireAdminOrModerator,
  roleValidation,
  paginationValidation,
  getUsersByRole
)

// Obtenir un utilisateur par ID
router.get('/:id', requireAdminOrModerator, uuidValidation, getUserById)

// Créer un nouvel utilisateur
router.post(
  '/',
  requireAdmin,
  adminActionLimiter,
  createUserValidation,
  createUser
)

// Mettre à jour un utilisateur
router.put(
  '/:id',
  requireAdmin,
  adminActionLimiter,
  uuidValidation,
  updateUserValidation,
  updateUser
)

// Supprimer un utilisateur
router.delete(
  '/:id',
  requireAdmin,
  adminActionLimiter,
  uuidValidation,
  deleteUser
)

// Réinitialiser le mot de passe d'un utilisateur
router.post(
  '/:id/reset-password',
  requireAdmin,
  adminActionLimiter,
  uuidValidation,
  resetPasswordValidation,
  resetUserPassword
)

// Activer/Désactiver un utilisateur
router.patch(
  '/:id/toggle-status',
  requireAdmin,
  adminActionLimiter,
  uuidValidation,
  toggleStatusValidation,
  toggleUserStatus
)

// Routes pour les opérations en lot (bulk operations)

// Activer plusieurs utilisateurs
router.post(
  '/bulk/activate',
  requireAdmin,
  adminActionLimiter,
  bulkUserIdsValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          errors: errors.array(),
        })
      }

      const { userIds } = req.body
      // Filter out the current user's ID to prevent self-modification in bulk operations
      const filteredUserIds = userIds.filter((id) => id !== req.user.id)

      if (filteredUserIds.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'Aucun utilisateur valide à activer (vous ne pouvez pas modifier votre propre compte via une opération en masse).',
        })
      }

      const [updatedCount] = await User.update(
        { isActive: true },
        { where: { id: { [Op.in]: filteredUserIds } } }
      )

      res.json({
        success: true,
        message: `${updatedCount} utilisateur(s) activé(s) avec succès.`,
        data: { activatedCount: updatedCount },
      })
    } catch (error) {
      console.error(
        "Erreur lors de l'activation en masse des utilisateurs:",
        error
      )
      res.status(500).json({
        success: false,
        message:
          "Erreur serveur lors de l'activation en masse des utilisateurs",
      })
    }
  }
)

// Désactiver plusieurs utilisateurs
router.post(
  '/bulk/deactivate',
  requireAdmin,
  adminActionLimiter,
  bulkUserIdsValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          errors: errors.array(),
        })
      }

      const { userIds } = req.body
      const filteredUserIds = userIds.filter((id) => id !== req.user.id)

      if (filteredUserIds.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'Aucun utilisateur valide à désactiver (vous ne pouvez pas désactiver votre propre compte).',
        })
      }

      const [updatedCount] = await User.update(
        { isActive: false, refreshToken: null }, // Invalider les sessions existantes
        { where: { id: { [Op.in]: filteredUserIds } } }
      )

      res.json({
        success: true,
        message: `${updatedCount} utilisateur(s) désactivé(s) avec succès.`,
        data: { deactivatedCount: updatedCount },
      })
    } catch (error) {
      console.error(
        'Erreur lors de la désactivation en masse des utilisateurs:',
        error
      )
      res.status(500).json({
        success: false,
        message:
          'Erreur serveur lors de la désactivation en masse des utilisateurs',
      })
    }
  }
)

// Supprimer plusieurs utilisateurs
router.delete(
  // Using DELETE verb for bulk deletion
  '/bulk/delete',
  requireAdmin,
  adminActionLimiter,
  bulkUserIdsValidation, // Validation applies to req.body for DELETE with a payload
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Erreurs de validation',
          errors: errors.array(),
        })
      }

      const { userIds } = req.body
      const filteredUserIds = userIds.filter((id) => id !== req.user.id)

      if (filteredUserIds.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'Aucun utilisateur valide à supprimer (vous ne pouvez pas supprimer votre propre compte).',
        })
      }

      const deletedCount = await User.destroy({
        where: { id: { [Op.in]: filteredUserIds } },
      })

      res.json({
        success: true,
        message: `${deletedCount} utilisateur(s) supprimé(s) avec succès.`,
        data: { deletedCount: deletedCount },
      })
    } catch (error) {
      console.error(
        'Erreur lors de la suppression en masse des utilisateurs:',
        error
      )
      res.status(500).json({
        success: false,
        message:
          'Erreur serveur lors de la suppression en masse des utilisateurs',
      })
    }
  }
)
module.exports = router
