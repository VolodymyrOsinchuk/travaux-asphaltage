// ============================================
// routes/blogRoutes.js - Routes du blog améliorées
const express = require('express')
const router = express.Router()

const {
  createPost,
  deletePost,
  getAllPosts,
  getAllTags,
  getBlogStats,
  getFeaturedPosts,
  getPostById,
  getPostBySlug,
  getPostCategories,
  getPostsByCategory,
  getPostsByTag,
  getRelatedPosts,
  togglePostStatus,
  updatePost,
} = require('../controllers/blogController')
const {
  authenticateToken,
  requireRole,
  checkPostOwnership,
} = require('../middleware/auth')
const {
  validateCreatePost,
  validateUpdatePost,
  validatePostId,
  validateSlug,
  validateCategory,
  validateTag,
  validateQueryParams,
} = require('../middleware/validation')
const {
  generalLimiter,
  authLimiter,
  strictLimiter,
  uploadLimiter,
  // speedLimiter,
  readLimiter,
} = require('../middleware/rateLimit')

// ============================================
// ROUTES PUBLIQUES (lecture)
// ============================================

// GET /api/blogs - Obtenir tous les articles (avec pagination et filtres)
router.get('/', readLimiter, validateQueryParams, getAllPosts)

// GET /api/blogs/featured - Obtenir les articles en vedette
router.get('/featured', readLimiter, validateQueryParams, getFeaturedPosts)

// GET /api/blogs/categories - Obtenir toutes les catégories
router.get('/categories', readLimiter, getPostCategories)

// GET /api/blogs/tags - Obtenir tous les tags
router.get('/tags', readLimiter, getAllTags)

// GET /api/blogs/stats - Obtenir les statistiques du blog
router.get(
  '/stats',
  readLimiter,
  authenticateToken,
  requireRole('admin', 'editor'),
  getBlogStats
)

// GET /api/blogs/category/:category - Obtenir les articles par catégorie
router.get(
  '/category/:category',
  readLimiter,
  validateCategory,
  validateQueryParams,
  getPostsByCategory
)

// GET /api/blogs/tag/:tag - Obtenir les articles par tag
router.get(
  '/tag/:tag',
  readLimiter,
  validateTag,
  validateQueryParams,
  getPostsByTag
)

// GET /api/blogs/slug/:slug - Obtenir un article par slug (public)
router.get('/slug/:slug', readLimiter, validateSlug, getPostBySlug)

// GET /api/blogs/:id - Obtenir un article par ID
router.get('/:id', readLimiter, validatePostId, getPostById)

// GET /api/blogs/:id/related - Obtenir les articles connexes
router.get(
  '/:id/related',
  readLimiter,
  validatePostId,
  validateQueryParams,
  getRelatedPosts
)

// ============================================
// ROUTES PROTÉGÉES (écriture)
// ============================================

// POST /api/blogs - Créer un nouvel article
router.post(
  '/',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor', 'author'),
  validateCreatePost,
  createPost
)

// PUT /api/blogs/:id - Mettre à jour un article
router.put(
  '/:id',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor', 'author'),
  validatePostId,
  validateUpdatePost,
  checkPostOwnership,
  updatePost
)

// DELETE /api/blogs/:id - Supprimer un article
router.delete(
  '/:id',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor', 'author'),
  validatePostId,
  checkPostOwnership,
  deletePost
)

// PATCH /api/blogs/:id/status - Changer le statut d'un article
router.patch(
  '/:id/status',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor', 'author'),
  validatePostId,
  checkPostOwnership,
  togglePostStatus
)

// ============================================
// ROUTES ADMIN UNIQUEMENT
// ============================================

// PATCH /api/blogs/:id/featured - Marquer/démarquer comme featured
router.patch(
  '/:id/featured',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor'),
  validatePostId,
  async (req, res) => {
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

      await post.toggleFeatured()

      const updatedPost = await Blog.findByPk(id, {
        include: [
          {
            model: require('../models').User,
            as: 'author',
            attributes: ['id', 'name', 'email'],
          },
        ],
      })

      res.json({
        success: true,
        data: { post: updatedPost },
        message: `Article ${
          updatedPost.isFeatured ? 'mis' : 'retiré'
        } en vedette`,
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

// POST /api/blogs/:id/publish - Publier un article
router.post(
  '/:id/publish',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor'),
  validatePostId,
  async (req, res) => {
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

      await post.publish()

      const updatedPost = await Blog.findByPk(id, {
        include: [
          {
            model: require('../models').User,
            as: 'author',
            attributes: ['id', 'name', 'email'],
          },
        ],
      })

      res.json({
        success: true,
        data: { post: updatedPost },
        message: 'Article publié avec succès',
      })
    } catch (error) {
      console.error('Erreur lors de la publication:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      })
    }
  }
)

// POST /api/blogs/:id/unpublish - Dépublier un article
router.post(
  '/:id/unpublish',
  strictLimiter,
  authenticateToken,
  requireRole('admin', 'editor'),
  validatePostId,
  async (req, res) => {
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

      await post.unpublish()

      const updatedPost = await Blog.findByPk(id, {
        include: [
          {
            model: require('../models').User,
            as: 'author',
            attributes: ['id', 'name', 'email'],
          },
        ],
      })

      res.json({
        success: true,
        data: { post: updatedPost },
        message: 'Article dépublié avec succès',
      })
    } catch (error) {
      console.error('Erreur lors de la dépublication:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      })
    }
  }
)

// ============================================
// GESTION DES ERREURS
// ============================================

// Middleware de gestion d'erreurs spécifique aux routes blog
router.use((error, req, res, next) => {
  console.error('Erreur dans les routes blog:', error)

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    })
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Conflit de données',
      error: 'Cette valeur existe déjà',
    })
  }

  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
  })
})

module.exports = router
