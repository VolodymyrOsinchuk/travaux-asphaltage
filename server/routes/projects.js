// routes/projects.js - Routes projets améliorées
const express = require('express')
const router = express.Router()
const { body, param, query } = require('express-validator')
const {
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  getProjectCategories,
  getRelatedProjects,
} = require('../controllers/projectController')
const {
  authenticateToken,
  requireRole,
  optionalAuth,
  rateLimitByUser,
} = require('../middleware/auth')

// Validation schemas
const projectValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit contenir entre 3 et 100 caractères')
    .trim()
    .escape(),

  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères')
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
    .trim()
    .escape(),

  body('status')
    .optional()
    .isIn(['draft', 'in_progress', 'completed', 'on_hold', 'cancelled'])
    .withMessage('Statut invalide'),

  body('projectType')
    .isIn(['website', 'mobile_app', 'web_app', 'ecommerce', 'other'])
    .withMessage('Type de projet invalide'),

  body('client')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le nom du client ne peut pas dépasser 100 caractères')
    .trim()
    .escape(),

  body('liveUrl').optional().isURL().withMessage('URL live invalide'),

  body('githubUrl').optional().isURL().withMessage('URL GitHub invalide'),

  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le budget doit être un nombre positif'),

  body('technologies')
    .optional()
    .isArray()
    .withMessage('Technologies doit être un tableau'),

  body('features')
    .optional()
    .isArray()
    .withMessage('Features doit être un tableau'),

  body('tags').optional().isArray().withMessage('Tags doit être un tableau'),

  body('serviceId')
    .optional()
    .isInt()
    .withMessage('Service ID doit être un entier'),
]

const updateProjectValidation = [
  param('id').isInt().withMessage('ID du projet invalide'),

  ...projectValidation.map((validation) => validation.optional()),
]

const idValidation = [param('id').isInt().withMessage('ID du projet invalide')]

const slugValidation = [
  param('slug')
    .isLength({ min: 3, max: 120 })
    .withMessage('Slug invalide')
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    ),
]

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),

  query('category')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Catégorie invalide'),

  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured doit être un booléen'),

  query('active')
    .optional()
    .isBoolean()
    .withMessage('Active doit être un booléen'),

  query('serviceId')
    .optional()
    .isInt()
    .withMessage('Service ID doit être un entier'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'order', 'viewCount'])
    .withMessage('Champ de tri invalide'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Ordre de tri invalide'),
]

// Routes publiques
router.get('/', queryValidation, optionalAuth, getAllProjects)

router.get('/categories', getProjectCategories)

router.get('/slug/:slug', slugValidation, optionalAuth, getProjectBySlug)

router.get('/:id', idValidation, optionalAuth, getProjectById)

router.get(
  '/:id/related',
  idValidation,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La limite doit être entre 1 et 10'),
  getRelatedProjects
)

// Routes protégées (admin uniquement)
router.post(
  '/',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(20, 60 * 60 * 1000), // 20 créations par heure
  projectValidation,
  createProject
)

router.put(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(50, 60 * 60 * 1000), // 50 mises à jour par heure
  updateProjectValidation,
  updateProject
)

router.delete(
  '/:id',
  authenticateToken,
  requireRole(['admin']),
  rateLimitByUser(10, 60 * 60 * 1000), // 10 suppressions par heure
  idValidation,
  deleteProject
)

// Route pour incrémenter le nombre de vues (publique mais avec rate limiting)
router.patch(
  '/:id/view',
  idValidation,
  rateLimitByUser(10, 60 * 1000), // 10 vues par minute par utilisateur
  async (req, res) => {
    try {
      const { id } = req.params
      const { Project } = require('../models')

      const project = await Project.findByPk(id)

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé',
        })
      }

      if (!project.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Projet non disponible',
        })
      }

      await project.incrementViewCount()

      res.json({
        success: true,
        data: {
          viewCount: project.viewCount + 1,
        },
        message: 'Nombre de vues mis à jour',
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour des vues:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      })
    }
  }
)

// Route pour basculer le statut d'activité (admin uniquement)
router.patch(
  '/:id/toggle-status',
  authenticateToken,
  requireRole(['admin']),
  idValidation,
  async (req, res) => {
    try {
      const { id } = req.params
      const { Project } = require('../models')

      const project = await Project.findByPk(id)

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé',
        })
      }

      await project.update({ isActive: !project.isActive })

      res.json({
        success: true,
        data: {
          project: {
            id: project.id,
            title: project.title,
            isActive: project.isActive,
          },
        },
        message: `Projet ${
          project.isActive ? 'activé' : 'désactivé'
        } avec succès`,
      })
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      })
    }
  }
)

// Route pour basculer le statut featured (admin uniquement)
router.patch(
  '/:id/toggle-featured',
  authenticateToken,
  requireRole(['admin']),
  idValidation,
  async (req, res) => {
    try {
      const { id } = req.params
      const { Project } = require('../models')

      const project = await Project.findByPk(id)

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Projet non trouvé',
        })
      }

      await project.update({ isFeatured: !project.isFeatured })

      res.json({
        success: true,
        data: {
          project: {
            id: project.id,
            title: project.title,
            isFeatured: project.isFeatured,
          },
        },
        message: `Projet ${
          project.isFeatured ? 'mis en avant' : 'retiré de la mise en avant'
        } avec succès`,
      })
    } catch (error) {
      console.error('Erreur lors du changement de statut featured:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      })
    }
  }
)

// Middleware de gestion d'erreurs pour les routes non trouvées
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  })
})

module.exports = router
