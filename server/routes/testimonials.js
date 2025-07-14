// routes/testimonials.js - Routes témoignages
const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  rejectTestimonial,
  getFeaturedTestimonials,
  getPendingTestimonials,
  getTestimonialStats,
  toggleFeaturedStatus,
  updateDisplayOrder,
} = require('../controllers/testimonialController')

const {
  authenticateToken,
  requireRole,
  optionalAuth,
  rateLimitByUser,
} = require('../middleware/auth')

// Validation pour la création/mise à jour
const testimonialValidation = [
  body('clientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom de l'entreprise ne peut pas dépasser 100 caractères"),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le poste ne peut pas dépasser 100 caractères'),
  body('testimonialText')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Le témoignage doit contenir entre 10 et 1000 caractères'),
  body('projectTitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Le titre du projet ne peut pas dépasser 200 caractères'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La note doit être entre 1 et 5'),
  body('projectId').optional().isInt().withMessage('ID de projet invalide'),
]

// Routes publiques
router.get('/', optionalAuth, getAllTestimonials)
router.get('/featured', getFeaturedTestimonials)
router.get('/:id', optionalAuth, getTestimonialById)

// Soumission publique avec limitation de taux
router.post(
  '/',
  rateLimitByUser(5, 60 * 60 * 1000), // 5 témoignages par heure
  testimonialValidation,
  createTestimonial
)

// Routes protégées (admin uniquement)
router.get(
  '/admin/pending',
  authenticateToken,
  requireRole(['admin']),
  getPendingTestimonials
)

router.get(
  '/admin/stats',
  authenticateToken,
  requireRole(['admin']),
  getTestimonialStats
)

router.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  testimonialValidation,
  updateTestimonial
)

router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  deleteTestimonial
)

router.patch(
  '/:id/approve',
  authenticateToken,
  requireRole(['admin']),
  approveTestimonial
)

router.patch(
  '/:id/reject',
  authenticateToken,
  requireRole(['admin']),
  rejectTestimonial
)

router.patch(
  '/:id/featured',
  authenticateToken,
  requireRole(['admin']),
  toggleFeaturedStatus
)

router.patch(
  '/admin/order',
  authenticateToken,
  requireRole(['admin']),
  updateDisplayOrder
)

module.exports = router
