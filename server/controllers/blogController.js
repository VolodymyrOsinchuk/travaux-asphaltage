// controllers/blogController.js
const { Blog, User } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Obtenir tous les articles de blog
exports.getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      status = 'published',
      search,
      tags,
      sortBy = 'publishedAt',
      sortOrder = 'DESC',
      includeAuthor = false,
    } = req.query

    const offset = (page - 1) * limit
    const whereClause = {}
    const include = []

    // Filtres
    if (status) {
      whereClause.status = status
    }

    if (category) {
      whereClause.category = category
    }

    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true'
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      whereClause[Op.or] = tagArray.map((tag) => ({
        tags: {
          [Op.like]: `%${tag}%`,
        },
      }))
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
      ]
    }

    // Inclure l'auteur si demandé
    if (includeAuthor === 'true') {
      include.push({
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'avatar'],
      })
    }

    const posts = await Blog.findAndCountAll({
      where: whereClause,
      include,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        'id',
        'title',
        'slug',
        'excerpt',
        'featuredImage',
        'category',
        'tags',
        'readTime',
        'viewCount',
        'status',
        'isFeatured',
        'publishedAt',
        'createdAt',
        'updatedAt',
      ],
    })

    res.json({
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(posts.count / limit),
          totalItems: posts.count,
          itemsPerPage: parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir un article par ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params
    const { includeAuthor = false } = req.query

    const include = []
    if (includeAuthor === 'true') {
      include.push({
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'avatar'],
      })
    }

    const post = await Blog.findByPk(id, { include })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    res.json({
      success: true,
      data: { post },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'article",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir un article par slug
exports.getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const { includeAuthor = false } = req.query

    const include = []
    if (includeAuthor === 'true') {
      include.push({
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'avatar'],
      })
    }

    const post = await Blog.findBySlug(slug, false)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    // Incrémenter le nombre de vues
    await post.incrementViewCount()

    res.json({
      success: true,
      data: { post },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'article",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Créer un nouvel article
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const postData = {
      ...req.body,
      authorId: req.user.id,
    }

    const post = await Blog.create(postData)

    res.status(201).json({
      success: true,
      data: { post },
      message: 'Article créé avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de l'article",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Mettre à jour un article
exports.updatePost = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const post = await Blog.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    const updatedPost = await post.update(req.body)

    res.json({
      success: true,
      data: { post: updatedPost },
      message: 'Article mis à jour avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de l'article",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Supprimer un article
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params
    const post = await Blog.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    await post.destroy()

    res.json({
      success: true,
      message: 'Article supprimé avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de l'article",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Basculer le statut d'un article
exports.togglePostStatus = async (req, res) => {
  try {
    const { id } = req.params
    const post = await Blog.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    if (post.status === 'published') {
      await post.unpublish()
    } else {
      await post.publish()
    }

    res.json({
      success: true,
      data: { post },
      message: "Statut de l'article mis à jour avec succès",
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de statut',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir les articles par catégorie
exports.getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const { page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit
    const posts = await Blog.findByCategory(category, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: { posts },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération par catégorie:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération par catégorie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir les articles par tag
exports.getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params
    const { page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit
    const posts = await Blog.findByTags(tag, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: { posts },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération par tag:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération par tag',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir les catégories d'articles
exports.getPostCategories = async (req, res) => {
  try {
    const categories = await Blog.findAll({
      attributes: ['category'],
      where: {
        status: 'published',
        category: {
          [Op.ne]: null,
        },
      },
      group: ['category'],
      raw: true,
    })

    const categoryList = categories.map((cat) => cat.category)

    res.json({
      success: true,
      data: { categories: categoryList },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des catégories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir tous les tags
exports.getAllTags = async (req, res) => {
  try {
    const posts = await Blog.findAll({
      attributes: ['tags'],
      where: {
        status: 'published',
        tags: {
          [Op.ne]: null,
        },
      },
      raw: true,
    })

    const allTags = new Set()
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => allTags.add(tag.trim()))
      }
    })

    res.json({
      success: true,
      data: { tags: Array.from(allTags) },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir les articles en vedette
exports.getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query
    const posts = await Blog.findFeatured({
      limit: parseInt(limit),
      attributes: [
        'id',
        'title',
        'slug',
        'excerpt',
        'featuredImage',
        'category',
        'readTime',
        'viewCount',
        'publishedAt',
      ],
    })

    res.json({
      success: true,
      data: { posts },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des articles en vedette:',
      error
    )
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des articles en vedette',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir les articles connexes
exports.getRelatedPosts = async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 3 } = req.query

    const currentPost = await Blog.findByPk(id)

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé',
      })
    }

    const relatedPosts = await currentPost.getRelatedPosts(parseInt(limit))

    res.json({
      success: true,
      data: { posts: relatedPosts },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des articles connexes:',
      error
    )
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des articles connexes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir les statistiques du blog
exports.getBlogStats = async (req, res) => {
  try {
    const stats = await Blog.getStats()

    const postsByCategory = await Blog.findAll({
      where: { status: 'published' },
      attributes: ['category', [Blog.sequelize.fn('COUNT', '*'), 'count']],
      group: ['category'],
    })

    const recentPosts = await Blog.findAll({
      where: { status: 'published' },
      limit: 5,
      order: [['publishedAt', 'DESC']],
      attributes: ['id', 'title', 'slug', 'viewCount', 'publishedAt'],
    })

    res.json({
      success: true,
      data: {
        ...stats,
        postsByCategory: postsByCategory.map((item) => ({
          category: item.category,
          count: parseInt(item.dataValues.count),
        })),
        recentPosts,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}
