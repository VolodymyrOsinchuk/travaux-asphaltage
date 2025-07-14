// models/Contact.js
const { DataTypes } = require('sequelize')

const ContactModel = (sequelize) => {
  const Contact = sequelize.define(
    'Contact',
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
          is: /^[a-zA-ZÀ-ÿ\s'-]+$/,
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
        set(value) {
          this.setDataValue('email', value.toLowerCase().trim())
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[\+]?[0-9\s\-\(\)\.]{8,20}$/,
        },
      },
      company: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [5, 200],
          notEmpty: true,
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [10, 2000],
          notEmpty: true,
        },
      },
      projectType: {
        type: DataTypes.ENUM(
          'website',
          'mobile-app',
          'e-commerce',
          'web-app',
          'api',
          'maintenance',
          'consulting',
          'other'
        ),
        allowNull: true,
        defaultValue: 'other',
      },
      budget: {
        type: DataTypes.ENUM(
          'less-than-5k',
          '5k-15k',
          '15k-50k',
          '50k-100k',
          'more-than-100k',
          'to-discuss'
        ),
        allowNull: true,
        defaultValue: 'to-discuss',
      },
      timeline: {
        type: DataTypes.ENUM(
          'urgent',
          'within-month',
          'within-3-months',
          'within-6-months',
          'flexible'
        ),
        allowNull: true,
        defaultValue: 'flexible',
      },
      status: {
        type: DataTypes.ENUM('new', 'read', 'replied', 'closed'),
        allowNull: false,
        defaultValue: 'new',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes internes pour le suivi',
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address du client (IPv4 ou IPv6)',
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User agent du navigateur',
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'website',
        comment: 'Source du contact (website, social, referral, etc.)',
      },
      referrer: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL de référence',
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'fr',
        validate: {
          isIn: [['fr', 'en', 'es', 'de', 'it']],
        },
      },
      isSpam: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Marqué comme spam',
      },
      repliedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de première réponse',
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de fermeture',
      },
    },
    {
      tableName: 'contacts',
      timestamps: true,
      paranoid: true, // Soft delete
      indexes: [
        {
          fields: ['email'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['priority'],
        },
        {
          fields: ['projectType'],
        },
        {
          fields: ['createdAt'],
        },
        {
          fields: ['isRead'],
        },
        {
          fields: ['isSpam'],
        },
      ],
      hooks: {
        beforeCreate: (contact) => {
          // Auto-détection de la priorité basée sur certains mots-clés
          const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediately']
          const highPriorityKeywords = ['important', 'priority', 'deadline']

          const messageText = (
            contact.message +
            ' ' +
            contact.subject
          ).toLowerCase()

          if (urgentKeywords.some((keyword) => messageText.includes(keyword))) {
            contact.priority = 'high'
          } else if (
            highPriorityKeywords.some((keyword) =>
              messageText.includes(keyword)
            )
          ) {
            contact.priority = 'high'
          }

          // Détection simple de spam
          const spamKeywords = [
            'bitcoin',
            'cryptocurrency',
            'loan',
            'casino',
            'viagra',
          ]
          if (spamKeywords.some((keyword) => messageText.includes(keyword))) {
            contact.isSpam = true
            contact.priority = 'low'
          }
        },
        beforeUpdate: (contact) => {
          // Mettre à jour les timestamps automatiquement
          if (contact.changed('status')) {
            if (contact.status === 'replied' && !contact.repliedAt) {
              contact.repliedAt = new Date()
            }
            if (contact.status === 'closed' && !contact.closedAt) {
              contact.closedAt = new Date()
            }
          }

          // Marquer comme lu si le statut change
          if (contact.status !== 'new' && !contact.isRead) {
            contact.isRead = true
          }
        },
      },
      scopes: {
        // Scopes pour faciliter les requêtes
        unread: {
          where: { isRead: false },
        },
        new: {
          where: { status: 'new' },
        },
        highPriority: {
          where: { priority: 'high' },
        },
        notSpam: {
          where: { isSpam: false },
        },
        recent: {
          where: {
            createdAt: {
              [require('sequelize').Op.gte]: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ),
            },
          },
        },
        withoutSensitiveData: {
          attributes: { exclude: ['ipAddress', 'userAgent', 'deletedAt'] },
        },
      },
    }
  )

  // Méthodes d'instance
  Contact.prototype.markAsRead = function () {
    return this.update({
      isRead: true,
      status: this.status === 'new' ? 'read' : this.status,
    })
  }

  Contact.prototype.markAsReplied = function () {
    return this.update({
      status: 'replied',
      isRead: true,
      repliedAt: this.repliedAt || new Date(),
    })
  }

  Contact.prototype.markAsClosed = function () {
    return this.update({
      status: 'closed',
      isRead: true,
      closedAt: this.closedAt || new Date(),
    })
  }

  Contact.prototype.toggleSpam = function () {
    return this.update({ isSpam: !this.isSpam })
  }

  Contact.prototype.getResponseTime = function () {
    if (!this.repliedAt) return null
    return Math.floor((this.repliedAt - this.createdAt) / (1000 * 60 * 60)) // en heures
  }

  // Méthodes statiques
  Contact.getStats = async function () {
    const [total, unread, highPriority, spam] = await Promise.all([
      this.count(),
      this.scope('unread').count(),
      this.scope('highPriority').count(),
      this.count({ where: { isSpam: true } }),
    ])

    return { total, unread, highPriority, spam }
  }

  Contact.getRecentContacts = function (limit = 10) {
    return this.scope(['recent', 'notSpam', 'withoutSensitiveData']).findAll({
      order: [['createdAt', 'DESC']],
      limit,
    })
  }

  Contact.findByEmail = function (email) {
    return this.findAll({
      where: { email: email.toLowerCase().trim() },
      order: [['createdAt', 'DESC']],
    })
  }

  return Contact
}

module.exports = ContactModel
