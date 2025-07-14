// models/Quote.js
const QuoteModel = (sequelize, DataTypes) => {
  const Quote = sequelize.define(
    'Quote',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
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
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      projectDescription: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: {
          len: [20, 2000],
          notEmpty: true,
        },
      },
      budget: {
        type: DataTypes.ENUM(
          '< 1000',
          '1000-5000',
          '5000-10000',
          '10000-25000',
          '> 25000'
        ),
        allowNull: false,
      },
      timeline: {
        type: DataTypes.ENUM(
          'urgent',
          '1-2 weeks',
          '1 month',
          '2-3 months',
          '> 3 months'
        ),
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
      features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      additionalInfo: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'reviewed',
          'quoted',
          'accepted',
          'rejected',
          'cancelled'
        ),
        defaultValue: 'pending',
        allowNull: false,
      },
      estimatedPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      quotedPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      notes: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        comment: 'Notes internes',
      },
      validUntil: {
        type: DataTypes.DATE,
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
    },
    {
      tableName: 'quotes',
      timestamps: true,
    }
  )

  Quote.findPending = function () {
    return this.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
    })
  }

  Quote.findByStatus = function (status) {
    return this.findAll({
      where: { status },
      order: [['createdAt', 'DESC']],
    })
  }

  Quote.associate = function (models) {
    Quote.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    })
  }

  return Quote
}

module.exports = QuoteModel
