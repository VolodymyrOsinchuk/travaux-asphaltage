const { Project, Service } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Obtenir tous les projets
exports.getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      active = true,
      search,
      serviceId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
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

    if (serviceId) {
      whereClause.serviceId = serviceId
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ]
    }

    const projects = await Project.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    })

    res.json({
      success: true,
      data: {
        projects: projects.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(projects.count / limit),
          totalItems: projects.count,
          itemsPerPage: parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des projets',
    })
  }
}

// Obtenir un projet par ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params

    const project = await Project.findByPk(id, {
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé',
      })
    }

    res.json({
      success: true,
      data: {
        project,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du projet',
    })
  }
}

// Obtenir un projet par slug
exports.getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const project = await Project.findOne({
      where: { slug },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé',
      })
    }

    res.json({
      success: true,
      data: {
        project,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du projet',
    })
  }
}

// Créer un nouveau projet
exports.createProject = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const project = await Project.create(req.body)

    const projectWithService = await Project.findByPk(project.id, {
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    })

    res.status(201).json({
      success: true,
      data: {
        project: projectWithService,
      },
      message: 'Projet créé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du projet',
    })
  }
}

// Mettre à jour un projet
exports.updateProject = async (req, res) => {
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
    const project = await Project.findByPk(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé',
      })
    }

    await project.update(req.body)

    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    })

    res.json({
      success: true,
      data: {
        project: updatedProject,
      },
      message: 'Projet mis à jour avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du projet',
    })
  }
}

// Supprimer un projet
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findByPk(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé',
      })
    }

    await project.destroy()

    res.json({
      success: true,
      message: 'Projet supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du projet',
    })
  }
}

// Obtenir les catégories de projets
exports.getProjectCategories = async (req, res) => {
  try {
    const categories = await Project.findAll({
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

// Obtenir les projets connexes
exports.getRelatedProjects = async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 4 } = req.query

    const currentProject = await Project.findByPk(id)

    if (!currentProject) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé',
      })
    }

    const whereClause = {
      id: { [Op.ne]: id },
      isActive: true,
    }

    // Prioriser les projets de la même catégorie ou du même service
    if (currentProject.category) {
      whereClause[Op.or] = [
        { category: currentProject.category },
        { serviceId: currentProject.serviceId },
      ]
    } else if (currentProject.serviceId) {
      whereClause.serviceId = currentProject.serviceId
    }

    const relatedProjects = await Project.findAll({
      where: whereClause,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'title', 'slug', 'category'],
        },
      ],
    })

    res.json({
      success: true,
      data: {
        projects: relatedProjects,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des projets connexes:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des projets connexes',
    })
  }
}
