module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [3, 100],
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 120],
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
          len: [10, 2000],
          notEmpty: true,
        },
      },
      shortDescription: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [10, 255],
          notEmpty: true,
        },
      },
      client: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [2, 50],
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM(
          'draft',
          'in_progress',
          'completed',
          'on_hold',
          'cancelled'
        ),
        defaultValue: 'completed',
        allowNull: false,
      },
      projectType: {
        type: DataTypes.ENUM(
          'website',
          'mobile_app',
          'web_app',
          'ecommerce',
          'other'
        ),
        allowNull: false,
      },
      technologies: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Technologies utilisées',
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Fonctionnalités principales',
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Images du projet',
      },
      thumbnailImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Image principale/miniature',
      },
      liveUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      githubUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Durée du projet',
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Ordre d'affichage",
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      challenges: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: 'Défis rencontrés',
      },
      solutions: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: 'Solutions apportées',
      },
      results: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: 'Résultats obtenus',
      },
      seoTitle: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      seoDescription: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
      seoKeywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'services',
          key: 'id',
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      tableName: 'projects',
      timestamps: true,
      hooks: {
        beforeCreate: (project) => {
          if (!project.slug) {
            project.slug = project.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
          }
        },
        beforeUpdate: (project) => {
          if (project.changed('title') && !project.changed('slug')) {
            project.slug = project.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
          }
        },
      },
    }
  )

  // Méthodes d'instance
  Project.prototype.incrementViewCount = function () {
    return this.increment('viewCount')
  }

  Project.prototype.getFormattedBudget = function () {
    if (!this.budget) return 'Non spécifié'

    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })

    return formatter.format(this.budget)
  }

  Project.prototype.getDurationInDays = function () {
    if (!this.startDate || !this.endDate) return null

    const start = new Date(this.startDate)
    const end = new Date(this.endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  Project.prototype.isCompleted = function () {
    return this.status === 'completed'
  }

  // Méthodes de classe
  Project.findActive = function () {
    return this.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    })
  }

  Project.findFeatured = function () {
    return this.findAll({
      where: { isActive: true, isFeatured: true },
      order: [['order', 'ASC']],
    })
  }

  Project.findByCategory = function (category) {
    return this.findAll({
      where: { category, isActive: true },
      order: [['order', 'ASC']],
    })
  }

  Project.findByStatus = function (status) {
    return this.findAll({
      where: { status, isActive: true },
      order: [['createdAt', 'DESC']],
    })
  }

  Project.findBySlug = function (slug) {
    return this.findOne({ where: { slug } })
  }

  Project.searchProjects = function (query) {
    const { Op } = require('sequelize')
    return this.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { shortDescription: { [Op.like]: `%${query}%` } },
          { client: { [Op.like]: `%${query}%` } },
        ],
      },
      order: [['order', 'ASC']],
    })
  }

  // Associations
  Project.associate = function (models) {
    // Un projet appartient à un service
    Project.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    })

    // Un projet est créé par un utilisateur
    Project.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
    })

    // Un projet peut avoir plusieurs témoignages
    Project.hasMany(models.Testimonial, {
      foreignKey: 'projectId',
      as: 'testimonials',
    })
  }

  return Project
}
