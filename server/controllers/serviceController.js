const { Service } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Fonction utilitaire pour générer un slug
const generateSlug = (title) => {
  if (!title) return null

  return (
    title
      .toLowerCase()
      .trim()
      // Remplacer les accents
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Garder seulement les lettres, chiffres, espaces et tirets
      .replace(/[^a-z0-9\s-]/g, '')
      // Remplacer les espaces multiples par un seul
      .replace(/\s+/g, ' ')
      // Remplacer les espaces par des tirets
      .replace(/\s/g, '-')
      // Remplacer les tirets multiples par un seul
      .replace(/-+/g, '-')
      // Supprimer les tirets en début et fin
      .replace(/^-+|-+$/g, '')
  )
}

// Obtenir tous les services
exports.getAllServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      active,
      search,
      sortBy = 'order',
      sortOrder = 'ASC',
    } = req.query

    console.log('🔍 Query parameters:', req.query)

    const offset = (page - 1) * limit
    const whereClause = {}

    // Test simple : récupérer tous les services d'abord
    const allServices = await Service.findAll()
    console.log('🔍 All services in database:', allServices.length)

    // Si pas de services, arrêter ici
    if (allServices.length === 0) {
      return res.json({
        success: true,
        data: {
          services: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: parseInt(limit),
          },
        },
        message: 'Aucun service trouvé dans la base de données',
      })
    }

    // Filtres
    if (active !== undefined && active !== '') {
      whereClause.isActive = active === 'true'
    }

    if (category) {
      whereClause.category = category
    }

    if (featured !== undefined && featured !== '') {
      whereClause.isFeatured = featured === 'true'
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ]
    }

    console.log('🔍 Where clause:', whereClause)

    // Tri
    const orderClause = [[sortBy, sortOrder]]
    if (sortBy !== 'order') {
      orderClause.push(['order', 'ASC'])
    }

    // Requête simplifiée sans include pour tester
    const services = await Service.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      // Retirer temporairement les includes pour identifier le problème
      // include: [
      //   {
      //     model: require('../models').Project,
      //     as: 'projects',
      //     attributes: ['id', 'title', 'slug', 'thumbnailImage'],
      //     where: { isActive: true },
      //     required: false,
      //   },
      // ],
    })

    console.log('🚀 Services found with filters:', services.count)
    console.log(
      '🚀 First service:',
      services.rows[0] ? services.rows[0].title : 'No services'
    )

    res.json({
      success: true,
      data: {
        services: services.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(services.count / limit),
          totalItems: services.count,
          itemsPerPage: parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// Obtenir un service par ID
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params

    const service = await Service.findByPk(id, {
      include: [
        {
          model: require('../models').Project,
          as: 'projects',
          where: { isActive: true },
          required: false,
        },
      ],
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      })
    }

    res.json({
      success: true,
      data: {
        service,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du service',
    })
  }
}

// Obtenir un service par slug
exports.getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const service = await Service.findOne({
      where: { slug },
      include: [
        {
          model: require('../models').Project,
          as: 'projects',
          where: { isActive: true },
          required: false,
        },
      ],
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      })
    }

    res.json({
      success: true,
      data: {
        service,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du service:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du service',
    })
  }
}

// Créer un nouveau service
// Fonction pour générer un slug unique
const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = generateSlug(title)

  if (!baseSlug) {
    throw new Error('Impossible de générer un slug à partir du titre')
  }

  let uniqueSlug = baseSlug
  let counter = 1

  const { Op } = require('sequelize')

  const whereClause = { slug: uniqueSlug }
  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId }
  }

  while (await Service.findOne({ where: whereClause })) {
    uniqueSlug = `${baseSlug}-${counter}`
    whereClause.slug = uniqueSlug
    counter++
  }

  return uniqueSlug
}

exports.createService = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const serviceData = { ...req.body }

    // Générer le slug si il n'est pas fourni
    if (!serviceData.slug && serviceData.title) {
      try {
        serviceData.slug = await generateUniqueSlug(serviceData.title)
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la génération du slug',
          error: error.message,
        })
      }
    }

    const service = await Service.create(serviceData)

    res.status(201).json({
      success: true,
      data: {
        service,
      },
      message: 'Service créé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la création du service:', error)

    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
          value: err.value,
        })),
      })
    }

    // Gestion des erreurs d'unicité
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Conflit de données',
        errors: error.errors.map((err) => ({
          field: err.path,
          message: `${err.path} doit être unique`,
          value: err.value,
        })),
      })
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du service',
    })
  }
}

// Mettre à jour un service
exports.updateService = async (req, res) => {
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
    const service = await Service.findByPk(id)

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      })
    }

    await service.update(req.body)

    res.json({
      success: true,
      data: {
        service,
      },
      message: 'Service mis à jour avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du service:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du service',
    })
  }
}

// Supprimer un service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params
    const service = await Service.findByPk(id)

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      })
    }

    await service.destroy()

    res.json({
      success: true,
      message: 'Service supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du service:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du service',
    })
  }
}

// Obtenir les catégories de services
exports.getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.findAll({
      attributes: ['category'],
      where: {
        isActive: true,
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
      data: {
        categories: categoryList,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des catégories',
    })
  }
}

// Mettre à jour l'ordre des services
exports.updateServiceOrder = async (req, res) => {
  try {
    const { services } = req.body

    if (!Array.isArray(services)) {
      return res.status(400).json({
        success: false,
        message: 'Format de données invalide',
      })
    }

    // Mettre à jour l'ordre de chaque service
    const updatePromises = services.map(({ id, order }) => {
      return Service.update({ order }, { where: { id } })
    })

    await Promise.all(updatePromises)

    res.json({
      success: true,
      message: 'Ordre des services mis à jour avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de l'ordre",
    })
  }
}

// Méthodes à ajouter au serviceController.js

// Obtenir les services par catégorie (méthode manquante)
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params
    const {
      page = 1,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'ASC',
    } = req.query

    const offset = (page - 1) * limit

    const services = await Service.findAndCountAll({
      where: {
        category,
        isActive: true,
      },
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: require('../models').Project,
          as: 'projects',
          attributes: ['id', 'title', 'slug', 'thumbnailImage'],
          where: { isActive: true },
          required: false,
        },
      ],
    })

    res.json({
      success: true,
      data: {
        services: services.rows,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(services.count / limit),
          totalItems: services.count,
          itemsPerPage: parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des services par catégorie:',
      error
    )
    res.status(500).json({
      success: false,
      message:
        'Erreur serveur lors de la récupération des services par catégorie',
    })
  }
}

// Basculer le statut d'un service (méthode manquante)
exports.toggleServiceStatus = async (req, res) => {
  try {
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
