module.exports = (sequelize, DataTypes) => {
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

  const Service = sequelize.define(
    'Service',
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
          len: [10, 1000],
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
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      priceType: {
        type: DataTypes.ENUM('fixed', 'hourly', 'project', 'custom'),
        defaultValue: 'project',
        allowNull: false,
      },
      duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Durée estimée du service (ex: "2-3 semaines")',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [2, 50],
          notEmpty: true,
        },
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Liste des fonctionnalités incluses',
      },
      technologies: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Technologies utilisées',
      },
      deliverables: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Livrables du service',
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
    },
    {
      tableName: 'services',
      timestamps: true,
      hooks: {
        beforeValidate: async (service) => {
          // Générer le slug avant la validation si il n'est pas fourni
          if (!service.slug && service.title) {
            const baseSlug = generateSlug(service.title)

            if (baseSlug) {
              // Vérifier l'unicité du slug
              let uniqueSlug = baseSlug
              let counter = 1

              while (await Service.findOne({ where: { slug: uniqueSlug } })) {
                uniqueSlug = `${baseSlug}-${counter}`
                counter++
              }

              service.slug = uniqueSlug
            }
          }
        },
        beforeUpdate: async (service) => {
          // Régénérer le slug si le titre change et qu'aucun slug n'est fourni
          if (service.changed('title') && !service.changed('slug')) {
            const baseSlug = generateSlug(service.title)

            if (baseSlug) {
              // Vérifier l'unicité du slug (exclure le service actuel)
              let uniqueSlug = baseSlug
              let counter = 1

              while (
                await Service.findOne({
                  where: {
                    slug: uniqueSlug,
                    id: { [sequelize.Sequelize.Op.ne]: service.id },
                  },
                })
              ) {
                uniqueSlug = `${baseSlug}-${counter}`
                counter++
              }

              service.slug = uniqueSlug
            }
          }
        },
      },
    }
  )

  // Méthodes d'instance
  Service.prototype.incrementViewCount = function () {
    return this.increment('viewCount')
  }

  Service.prototype.getFormattedPrice = function () {
    if (!this.price) return 'Sur devis'

    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })

    switch (this.priceType) {
      case 'hourly':
        return `${formatter.format(this.price)}/h`
      case 'fixed':
        return formatter.format(this.price)
      case 'project':
        return `À partir de ${formatter.format(this.price)}`
      default:
        return 'Sur devis'
    }
  }

  // Méthodes de classe
  Service.findActive = function () {
    return this.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    })
  }

  Service.findFeatured = function () {
    return this.findAll({
      where: { isActive: true, isFeatured: true },
      order: [['order', 'ASC']],
    })
  }

  Service.findByCategory = function (category) {
    return this.findAll({
      where: { category, isActive: true },
      order: [['order', 'ASC']],
    })
  }

  Service.findBySlug = function (slug) {
    return this.findOne({ where: { slug } })
  }

  Service.searchServices = function (query) {
    const { Op } = require('sequelize')
    return this.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
          { shortDescription: { [Op.like]: `%${query}%` } },
        ],
      },
      order: [['order', 'ASC']],
    })
  }

  // Associations
  Service.associate = function (models) {
    // Un service peut avoir plusieurs projets
    Service.hasMany(models.Project, {
      foreignKey: 'serviceId',
      as: 'projects',
    })

    // Un service peut avoir plusieurs devis
    Service.hasMany(models.Quote, {
      foreignKey: 'serviceId',
      as: 'quotes',
    })
  }

  return Service
}
