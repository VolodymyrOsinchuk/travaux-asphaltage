const { Service } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Obtenir tous les services
exports.getAllServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      active = true,
      search,
      sortBy = 'order',
      sortOrder = 'ASC',
    } = req.query

    const offset = (page - 1) * limit
    const whereClause = {}

    // Filtres
    if (active !== undefined) {
      whereClause.isActive = active === 'true'
    }

    if (category) {
      whereClause.category = category
    }

    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true'
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ]
    }

    // Tri
    const orderClause = [[sortBy, sortOrder]]
    if (sortBy !== 'order') {
      orderClause.push(['order', 'ASC'])
    }

    const services = await Service.findAndCountAll({
      where: whereClause,
      order: orderClause,
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

    const service = await Service.create(req.body)

    res.status(201).json({
      success: true,
      data: {
        service,
      },
      message: 'Service créé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la création du service:', error)
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
