// routes/contacts.js
const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  markAsRead,
  bulkDelete,
  getContactStats,
  replyToContact,
} = require('../controllers/contactController')
const { authenticateToken, requireRole } = require('../middleware/auth')

// Rate limiting pour les soumissions de contact
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 soumissions par IP
  message: {
    success: false,
    message: 'Trop de soumissions. Veuillez réessayer dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiting pour les routes admin
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.',
  },
})

// Validation pour la création de contact
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage(
      'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
    ),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email trop long (max 100 caractères)'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)\.]{8,20}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nom de société trop long (max 100 caractères)'),

  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le sujet doit contenir entre 5 et 200 caractères'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Le message doit contenir entre 10 et 2000 caractères'),

  body('projectType')
    .optional()
    .isIn([
      'website',
      'mobile_app',
      'web_app',
      'ecommerce',
      'consultation',
      'other',
    ])
    .withMessage('Type de projet invalide'),

  body('budget')
    .optional()
    .isIn(['< 1000', '1000-5000', '5000-10000', '10000-25000', '> 25000'])
    .withMessage('Budget invalide'),

  body('timeline')
    .optional()
    .isIn(['urgent', '1-2 weeks', '1 month', '2-3 months', '> 3 months'])
    .withMessage('Délai invalide'),
]

// Validation pour la mise à jour de contact
const validateContactUpdate = [
  body('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'closed'])
    .withMessage('Statut invalide'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priorité invalide'),

  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes trop longues (max 2000 caractères)'),
]

// Validation pour la réponse
const validateReply = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Le message doit contenir entre 10 et 5000 caractères'),
]

// Validation pour les actions en lot
const validateBulkAction = [
  body('ids')
    .isArray({ min: 1, max: 100 })
    .withMessage('IDs invalides (min: 1, max: 100)')
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error('Tous les IDs doivent être des entiers positifs')
      }
      return true
    }),
]

// Routes publiques
router.post('/', contactLimiter, validateContact, createContact)

// Routes protégées - Administration
router.use(adminLimiter)
router.use(authenticateToken)
router.use(requireRole(['admin', 'moderator']))

// Routes GET
router.get('/', getAllContacts)
router.get('/stats', getContactStats)
router.get('/:id', getContactById)

// Routes PUT/PATCH
router.put('/:id', validateContactUpdate, updateContact)
router.patch('/mark-read', validateBulkAction, markAsRead)
router.post('/:id/reply', validateReply, replyToContact)

// Routes DELETE
router.delete('/:id', deleteContact)
router.delete('/', validateBulkAction, bulkDelete)

module.exports = router
