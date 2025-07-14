// models/Testimonial.js
const TestimonialModel = (sequelize, DataTypes) => {
  const Testimonial = sequelize.define(
    'Testimonial',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [2, 100],
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      testimonialText: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
          len: [10, 1000],
          notEmpty: true,
        },
      },
      projectTitle: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
          min: 1,
          max: 5,
        },
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Par défaut non actif jusqu'à approbation
        allowNull: false,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'projects',
          key: 'id',
        },
      },
    },
    {
      tableName: 'testimonials',
      timestamps: true,
      indexes: [
        {
          fields: ['isActive', 'isFeatured'],
        },
        {
          fields: ['rating'],
        },
        {
          fields: ['createdAt'],
        },
        {
          fields: ['displayOrder'],
        },
      ],
    }
  )

  // Méthodes statiques
  Testimonial.findApproved = function (options = {}) {
    return this.findAll({
      where: { isActive: true },
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      ...options,
    })
  }

  Testimonial.findFeatured = function (options = {}) {
    return this.findAll({
      where: {
        isActive: true,
        isFeatured: true,
      },
      order: [['displayOrder', 'ASC']],
      ...options,
    })
  }

  Testimonial.findPending = function (options = {}) {
    return this.findAll({
      where: {
        isActive: false,
        approvedAt: null,
        rejectedAt: null,
      },
      order: [['createdAt', 'DESC']],
      ...options,
    })
  }

  // Associations
  Testimonial.associate = function (models) {
    Testimonial.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
    })

    Testimonial.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver',
    })
  }

  return Testimonial
}

module.exports = TestimonialModel
