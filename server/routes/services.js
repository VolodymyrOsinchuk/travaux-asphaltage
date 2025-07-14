// routes/services.js - Routes services améliorées
const express = require('express')
const router = express.Router()
const { body, param, query } = require('express-validator')
const {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  updateServiceOrder,
} = require('../controllers/serviceController')
const {
  authenticateToken,
  requireRole,
  requirePermission,
  optionalAuth,
  rateLimitByUser,
} = require('../middleware/auth')

// Validations
const serviceValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit contenir entre 3 et 100 caractères')
    .trim()
    .escape(),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères')
    .trim(),
  body('shortDescription')
    .isLength({ min: 10, max: 255 })
    .withMessage(
      'La description courte doit contenir entre 10 et 255 caractères'
    )
    .trim(),
  body('category')
    .isLength({ min: 2, max: 50 })
    .withMessage('La catégorie doit contenir entre 2 et 50 caractères')
    .trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix doit être un nombre positif'),
  body('priceType')
    .optional()
    .isIn(['fixed', 'hourly', 'project', 'custom'])
    .withMessage('Type de prix invalide'),
  body('duration')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La durée ne peut pas dépasser 50 caractères'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Les fonctionnalités doivent être un tableau'),
  body('technologies')
    .optional()
    .isArray()
    .withMessage('Les technologies doivent être un tableau'),
  body('deliverables')
    .optional()
    .isArray()
    .withMessage('Les livrables doivent être un tableau'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage("L'ordre doit être un entier positif"),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Le titre SEO ne peut pas dépasser 60 caractères'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('La description SEO ne peut pas dépasser 160 caractères'),
  body('seoKeywords')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Les mots-clés SEO ne peuvent pas dépasser 255 caractères'),
]

const updateServiceValidation = [
  ...serviceValidation.map((rule) => rule.optional()),
]

const orderValidation = [
  body('services')
    .isArray()
    .withMessage('Les services doivent être un tableau'),
  body('services.*.id').isInt({ min: 1 }).withMessage('ID de service invalide'),
  body('services.*.order').isInt({ min: 0 }).withMessage('Ordre invalide'),
]

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('sortBy')
    .optional()
    .isIn(['order', 'title', 'createdAt', 'updatedAt', 'viewCount'])
    .withMessage('Critère de tri invalide'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Ordre de tri invalide'),
  query('active')
    .optional()
    .isBoolean()
    .withMessage('Le paramètre active doit être un booléen'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Le paramètre featured doit être un booléen'),
]

const paramValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
]

const slugValidation = [
  param('slug')
    .isLength({ min: 3, max: 120 })
    .withMessage('Slug invalide')
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    ),
]

const categoryValidation = [
  param('category')
    .isLength({ min: 2, max: 50 })
    .withMessage('Catégorie invalide')
    .trim(),
]

// Routes publiques
router.get('/', queryValidation, optionalAuth, getAllServices)

router.get('/categories', getServiceCategories)

router.get('/slug/:slug', slugValidation, optionalAuth, getServiceBySlug)

router.get('/:id', paramValidation, optionalAuth, getServiceById)

// Routes protégées (admin uniquement)
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(50, 15 * 60 * 1000), // 50 requêtes par 15 minutes
  serviceValidation,
  createService
)

router.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(100, 15 * 60 * 1000),
  paramValidation,
  updateServiceValidation,
  updateService
)

router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(20, 15 * 60 * 1000),
  paramValidation,
  deleteService
)

router.patch(
  '/order',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(10, 15 * 60 * 1000),
  orderValidation,
  updateServiceOrder
)

// Route pour basculer le statut d'un service
router.patch(
  '/:id/toggle-status',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(50, 15 * 60 * 1000),
  paramValidation,
  async (req, res) => {
    try {
      const { Service } = require('../models')
      const { id } = req.params

      const service = await Service.findByPk(id)

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé',
        })
      }

      await service.update({ isActive: !service.isActive })

      res.json({
        success: true,
        data: {
          service,
        },
        message: `Service ${
          service.isActive ? 'activé' : 'désactivé'
        } avec succès`,
      })
    } catch (error) {
      console.error('Erreur lors du basculement du statut:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors du basculement du statut',
      })
    }
  }
)

// Route pour basculer le statut featured d'un service
router.patch(
  '/:id/toggle-featured',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(50, 15 * 60 * 1000),
  paramValidation,
  async (req, res) => {
    try {
      const { Service } = require('../models')
      const { id } = req.params

      const service = await Service.findByPk(id)

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé',
        })
      }

      await service.update({ isFeatured: !service.isFeatured })

      res.json({
        success: true,
        data: {
          service,
        },
        message: `Service ${
          service.isFeatured ? 'mis en avant' : 'retiré de la mise en avant'
        } avec succès`,
      })
    } catch (error) {
      console.error('Erreur lors du basculement du statut featured:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors du basculement du statut featured',
      })
    }
  }
)

// Route pour incrémenter le compteur de vues
router.post(
  '/:id/view',
  paramValidation,
  rateLimitByUser(1000, 15 * 60 * 1000), // Rate limit élevé pour les vues
  async (req, res) => {
    try {
      const { Service } = require('../models')
      const { id } = req.params

      const service = await Service.findByPk(id)

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service non trouvé',
        })
      }

      await service.incrementViewCount()

      res.json({
        success: true,
        message: 'Vue enregistrée',
      })
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la vue:", error)
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'enregistrement de la vue",
      })
    }
  }
)

// Route pour rechercher des services
router.get(
  '/search/:query',
  param('query')
    .isLength({ min: 2, max: 100 })
    .withMessage(
      'La requête de recherche doit contenir entre 2 et 100 caractères'
    )
    .trim(),
  queryValidation,
  optionalAuth,
  async (req, res) => {
    try {
      const { Service } = require('../models')
      const { query } = req.params
      const {
        page = 1,
        limit = 10,
        sortBy = 'order',
        sortOrder = 'ASC',
      } = req.query

      const offset = (page - 1) * limit

      const services = await Service.searchServices(query)

      // Pagination manuelle pour la méthode de recherche
      const totalItems = services.length
      const paginatedServices = services.slice(offset, offset + parseInt(limit))

      res.json({
        success: true,
        data: {
          services: paginatedServices,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            itemsPerPage: parseInt(limit),
          },
        },
      })
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la recherche',
      })
    }
  }
)

module.exports = router
