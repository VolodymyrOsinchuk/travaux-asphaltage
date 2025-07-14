// controllers/testimonialController.js
const { Testimonial, Project, User } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Obtenir tous les témoignages avec filtres avancés
exports.getAllTestimonials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      featured,
      active,
      search,
      rating,
      status = 'all', // all, pending, approved, rejected
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query

    const offset = (page - 1) * limit
    const whereClause = {}
    const include = []

    // Filtres de statut
    switch (status) {
      case 'pending':
        whereClause.isActive = false
        whereClause.approvedAt = null
        whereClause.rejectedAt = null
        break
      case 'approved':
        whereClause.isActive = true
        break
      case 'rejected':
        whereClause.isActive = false
        whereClause.rejectedAt = { [Op.not]: null }
        break
      default:
        if (active !== undefined) {
          whereClause.isActive = active === 'true'
        }
    }

    // Autres filtres
    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true'
    }

    if (rating) {
      whereClause.rating = parseInt(rating)
    }

    if (search) {
      whereClause[Op.or] = [
        { clientName: { [Op.like]: `%${search}%` } },
        { testimonialText: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { projectTitle: { [Op.like]: `%${search}%` } },
      ]
    }

    // Inclure les associations si nécessaire
    if (req.user?.role === 'admin') {
      include.push(
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name'],
        }
      )
    }

    const testimonials = await Testimonial.findAndCountAll({
      where: whereClause,
      include,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: {
        testimonials: testimonials.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(testimonials.count / limit),
          totalItems: testimonials.count,
          itemsPerPage: parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des témoignages:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des témoignages',
    })
  }
}

// Obtenir un témoignage par ID
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params

    const include = []
    if (req.user?.role === 'admin') {
      include.push(
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name'],
        }
      )
    }

    const testimonial = await Testimonial.findByPk(id, { include })

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      })
    }

    // Vérifier les permissions pour les témoignages non approuvés
    if (!testimonial.isActive && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
      })
    }

    res.json({
      success: true,
      data: {
        testimonial,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du témoignage:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du témoignage',
    })
  }
}

// Créer un nouveau témoignage
exports.createTestimonial = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    // Nettoyer les données d'entrée
    const testimonialData = {
      clientName: req.body.clientName?.trim(),
      email: req.body.email?.trim(),
      company: req.body.company?.trim(),
      position: req.body.position?.trim(),
      testimonialText: req.body.testimonialText?.trim(),
      projectTitle: req.body.projectTitle?.trim(),
      rating: parseInt(req.body.rating) || 5,
      projectId: req.body.projectId || null,
      isActive: false, // Nécessite une approbation
    }

    const testimonial = await Testimonial.create(testimonialData)

    res.status(201).json({
      success: true,
      data: {
        testimonial,
      },
      message:
        'Témoignage soumis avec succès. Il sera examiné avant publication.',
    })
  } catch (error) {
    console.error('Erreur lors de la création du témoignage:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du témoignage',
    })
  }
}

// Mettre à jour un témoignage (admin uniquement)
exports.updateTestimonial = async (req, res) => {
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
    const testimonial = await Testimonial.findByPk(id)

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      })
    }

    // Préparer les données de mise à jour
    const updateData = { ...req.body }

    // Nettoyer les chaînes de caractères
    if (updateData.clientName)
      updateData.clientName = updateData.clientName.trim()
    if (updateData.email) updateData.email = updateData.email.trim()
    if (updateData.company) updateData.company = updateData.company.trim()
    if (updateData.position) updateData.position = updateData.position.trim()
    if (updateData.testimonialText)
      updateData.testimonialText = updateData.testimonialText.trim()
    if (updateData.projectTitle)
      updateData.projectTitle = updateData.projectTitle.trim()

    await testimonial.update(updateData)

    res.json({
      success: true,
      data: {
        testimonial,
      },
      message: 'Témoignage mis à jour avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du témoignage:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du témoignage',
    })
  }
}

// Supprimer un témoignage
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params
    const testimonial = await Testimonial.findByPk(id)

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      })
    }

    await testimonial.destroy()

    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du témoignage:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du témoignage',
    })
  }
}

// Obtenir les témoignages en vedette (route publique)
exports.getFeaturedTestimonials = async (req, res) => {
  try {
    const { limit = 6 } = req.query

    const testimonials = await Testimonial.findFeatured({
      limit: parseInt(limit),
    })

    res.json({
      success: true,
      data: {
        testimonials,
      },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des témoignages en vedette:',
      error
    )
    res.status(500).json({
      success: false,
      message:
        'Erreur serveur lors de la récupération des témoignages en vedette',
    })
  }
}

// Obtenir les témoignages en attente (admin uniquement)
exports.getPendingTestimonials = async (req, res) => {
  try {
    const { limit = 20 } = req.query

    const testimonials = await Testimonial.findPending({
      limit: parseInt(limit),
    })

    res.json({
      success: true,
      data: {
        testimonials,
        count: testimonials.length,
      },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des témoignages en attente:',
      error
    )
    res.status(500).json({
      success: false,
      message:
        'Erreur serveur lors de la récupération des témoignages en attente',
    })
  }
}

// Obtenir les statistiques des témoignages (admin uniquement)
exports.getTestimonialStats = async (req, res) => {
  try {
    const [
      totalTestimonials,
      activeTestimonials,
      pendingTestimonials,
      averageRating,
      ratingDistribution,
    ] = await Promise.all([
      Testimonial.count(),
      Testimonial.count({ where: { isActive: true } }),
      Testimonial.count({
        where: {
          isActive: false,
          approvedAt: null,
          rejectedAt: null,
        },
      }),
      Testimonial.findOne({
        where: { isActive: true },
        attributes: [
          [
            Testimonial.sequelize.fn(
              'AVG',
              Testimonial.sequelize.col('rating')
            ),
            'averageRating',
          ],
        ],
      }),
      Testimonial.findAll({
        where: { isActive: true },
        attributes: [
          'rating',
          [Testimonial.sequelize.fn('COUNT', '*'), 'count'],
        ],
        group: ['rating'],
        order: [['rating', 'DESC']],
      }),
    ])

    res.json({
      success: true,
      data: {
        totalTestimonials,
        activeTestimonials,
        pendingTestimonials,
        averageRating: averageRating?.dataValues?.averageRating
          ? parseFloat(averageRating.dataValues.averageRating).toFixed(1)
          : '0.0',
        ratingDistribution: ratingDistribution.map((item) => ({
          rating: item.rating,
          count: parseInt(item.dataValues.count),
        })),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
    })
  }
}

// Approuver un témoignage
exports.approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params
    const testimonial = await Testimonial.findByPk(id)

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      })
    }

    if (testimonial.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce témoignage est déjà approuvé',
      })
    }

    await testimonial.update({
      isActive: true,
      approvedAt: new Date(),
      approvedBy: req.user.id,
      rejectedAt: null, // Réinitialiser si précédemment rejeté
    })

    res.json({
      success: true,
      data: {
        testimonial,
      },
      message: 'Témoignage approuvé avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de l'approbation du témoignage:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'approbation du témoignage",
    })
  }
}

// Rejeter un témoignage
exports.rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params
    const testimonial = await Testimonial.findByPk(id)

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      })
    }

    await testimonial.update({
      isActive: false,
      rejectedAt: new Date(),
      approvedBy: req.user.id,
      approvedAt: null, // Réinitialiser si précédemment approuvé
    })

    res.json({
      success: true,
      data: {
        testimonial,
      },
      message: 'Témoignage rejeté avec succès',
    })
  } catch (error) {
    console.error('Erreur lors du rejet du témoignage:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du rejet du témoignage',
    })
  }
}

// Marquer/démarquer comme vedette
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params
    const testimonial = await Testimonial.findByPk(id)

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé',
      })
    }

    if (!testimonial.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Seuls les témoignages approuvés peuvent être mis en vedette',
      })
    }

    await testimonial.update({
      isFeatured: !testimonial.isFeatured,
    })

    res.json({
      success: true,
      data: {
        testimonial,
      },
      message: `Témoignage ${
        testimonial.isFeatured ? 'ajouté en' : 'retiré de la'
      } vedette`,
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut vedette:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de statut vedette',
    })
  }
}

// Mettre à jour l'ordre d'affichage
exports.updateDisplayOrder = async (req, res) => {
  try {
    const { testimonials } = req.body // Array of { id, displayOrder }

    if (!Array.isArray(testimonials)) {
      return res.status(400).json({
        success: false,
        message: 'Format de données invalide',
      })
    }

    await Promise.all(
      testimonials.map(({ id, displayOrder }) =>
        Testimonial.update({ displayOrder }, { where: { id } })
      )
    )

    res.json({
      success: true,
      message: "Ordre d'affichage mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'ordre:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de l'ordre",
    })
  }
}
