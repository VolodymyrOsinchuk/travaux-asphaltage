const { Contact } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')
const { sendEmail, validateEmailOptions } = require('../utils/email')
const logger = require('../middleware/logger') // Ajout du logger

// Obtenir tous les contacts avec pagination et filtres améliorés
exports.getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      projectType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      dateFrom,
      dateTo,
    } = req.query

    // Validation des paramètres
    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))) // Limite max de 100
    const offset = (pageNum - 1) * limitNum

    const whereClause = {}

    // Filtres améliorés
    if (status && ['new', 'read', 'replied', 'closed'].includes(status)) {
      whereClause.status = status
    }

    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      whereClause.priority = priority
    }

    if (projectType) {
      whereClause.projectType = projectType
    }

    // Filtre par date
    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom)
      if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo)
    }

    // Recherche améliorée
    if (search && search.trim()) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { email: { [Op.like]: `%${search.trim()}%` } },
        { company: { [Op.like]: `%${search.trim()}%` } },
        { subject: { [Op.like]: `%${search.trim()}%` } },
        { message: { [Op.like]: `%${search.trim()}%` } },
      ]
    }

    // Validation du tri
    const validSortFields = ['createdAt', 'name', 'email', 'status', 'priority']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    const { count, rows } = await Contact.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset,
      attributes: { exclude: ['ipAddress', 'userAgent'] }, // Exclure les données sensibles
    })

    res.json({
      success: true,
      data: {
        contacts: rows,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(count / limitNum),
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(count / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    })
  } catch (error) {
    logger.error('Erreur lors de la récupération des contacts:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des contacts',
    })
  }
}

// Obtenir un contact par ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params

    // Validation de l'ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      })
    }

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé',
      })
    }

    res.json({
      success: true,
      data: { contact },
    })
  } catch (error) {
    logger.error('Erreur lors de la récupération du contact:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du contact',
    })
  }
}

// Créer un nouveau contact
exports.createContact = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    // Nettoyage des données
    const cleanedData = {
      ...req.body,
      name: req.body.name?.trim(),
      email: req.body.email?.trim().toLowerCase(),
      company: req.body.company?.trim(),
      subject: req.body.subject?.trim(),
      message: req.body.message?.trim(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    }

    const contact = await Contact.create(cleanedData)

    // Envoi des emails de manière asynchrone
    setImmediate(async () => {
      await sendNotificationEmails(contact)
    })

    res.status(201).json({
      success: true,
      data: { contact },
      message: 'Message envoyé avec succès',
    })
  } catch (error) {
    logger.error('Erreur lors de la création du contact:', error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'envoi du message",
    })
  }
}

// Fonction helper pour envoyer les emails
const sendNotificationEmails = async (contact) => {
  try {
    // Email à l'admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Nouveau message de contact: ${contact.subject}`,
      html: generateAdminNotificationHTML(contact),
    })

    // Email de confirmation au client
    await sendEmail({
      to: contact.email,
      subject: 'Confirmation de réception de votre message',
      html: generateClientConfirmationHTML(contact),
    })
  } catch (error) {
    logger.error("Erreur lors de l'envoi des emails:", error)
  }
}

// Générateur HTML pour l'email admin
const generateAdminNotificationHTML = (contact) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
      Nouveau message de contact
    </h2>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">Informations du contact</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold;">Nom:</td><td style="padding: 8px;">${
          contact.name
        }</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${
          contact.email
        }</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Téléphone:</td><td style="padding: 8px;">${
          contact.phone || 'Non fourni'
        }</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Entreprise:</td><td style="padding: 8px;">${
          contact.company || 'Non fourni'
        }</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Type de projet:</td><td style="padding: 8px;">${
          contact.projectType || 'Non spécifié'
        }</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Budget:</td><td style="padding: 8px;">${
          contact.budget || 'Non spécifié'
        }</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Délai:</td><td style="padding: 8px;">${
          contact.timeline || 'Non spécifié'
        }</td></tr>
      </table>
    </div>
    <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
      <h4 style="color: #333; margin-top: 0;">Sujet: ${contact.subject}</h4>
      <p style="color: #666; line-height: 1.6;">${contact.message.replace(
        /\n/g,
        '<br>'
      )}</p>
    </div>
    <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
      <p>IP: ${contact.ipAddress} | Date: ${new Date(
  contact.createdAt
).toLocaleString('fr-FR')}</p>
    </div>
  </div>
`

// Générateur HTML pour l'email de confirmation
const generateClientConfirmationHTML = (contact) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #007bff; text-align: center;">Merci pour votre message</h2>
    <p style="color: #666; font-size: 16px;">Bonjour ${contact.name},</p>
    <p style="color: #666; font-size: 16px;">
      Nous avons bien reçu votre message concernant "${contact.subject}" 
      et nous vous remercions de nous avoir contactés.
    </p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #333; margin-top: 0;">Récapitulatif de votre demande</h3>
      <p style="color: #666; margin: 5px 0;"><strong>Sujet:</strong> ${
        contact.subject
      }</p>
      ${
        contact.projectType
          ? `<p style="color: #666; margin: 5px 0;"><strong>Type de projet:</strong> ${contact.projectType}</p>`
          : ''
      }
      ${
        contact.budget
          ? `<p style="color: #666; margin: 5px 0;"><strong>Budget:</strong> ${contact.budget}</p>`
          : ''
      }
      ${
        contact.timeline
          ? `<p style="color: #666; margin: 5px 0;"><strong>Délai souhaité:</strong> ${contact.timeline}</p>`
          : ''
      }
    </div>
    <p style="color: #666; font-size: 16px;">
      Nous vous répondrons dans les plus brefs délais, généralement sous 24 heures.
    </p>
    <p style="color: #666; font-size: 16px;">
      Cordialement,<br>
      <strong>L'équipe</strong>
    </p>
  </div>
`

// Mettre à jour un contact (remplace updateContactStatus)
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params
    const { status, priority, notes } = req.body

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé',
      })
    }

    const updateData = {}

    // Validation et mise à jour du statut
    if (status && ['new', 'read', 'replied', 'closed'].includes(status)) {
      updateData.status = status
      updateData.isRead = status !== 'new'
    }

    // Validation et mise à jour de la priorité
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
      updateData.priority = priority
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    await contact.update(updateData)

    res.json({
      success: true,
      data: { contact },
      message: 'Contact mis à jour avec succès',
    })
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du contact:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du contact',
    })
  }
}

// Supprimer un contact
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide',
      })
    }

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé',
      })
    }

    await contact.destroy()

    res.json({
      success: true,
      message: 'Contact supprimé avec succès',
    })
  } catch (error) {
    logger.error('Erreur lors de la suppression du contact:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du contact',
    })
  }
}

// Obtenir les statistiques des contacts
exports.getContactStats = async (req, res) => {
  try {
    const [
      totalContacts,
      newContacts,
      readContacts,
      repliedContacts,
      closedContacts,
      contactsByType,
      contactsByPriority,
      contactsByMonth,
    ] = await Promise.all([
      Contact.count(),
      Contact.count({ where: { status: 'new' } }),
      Contact.count({ where: { status: 'read' } }),
      Contact.count({ where: { status: 'replied' } }),
      Contact.count({ where: { status: 'closed' } }),
      Contact.findAll({
        attributes: [
          'projectType',
          [Contact.sequelize.fn('COUNT', '*'), 'count'],
        ],
        group: ['projectType'],
        where: { projectType: { [Op.not]: null } },
      }),
      Contact.findAll({
        attributes: ['priority', [Contact.sequelize.fn('COUNT', '*'), 'count']],
        group: ['priority'],
      }),
      Contact.findAll({
        attributes: [
          [
            Contact.sequelize.fn(
              'DATE_FORMAT',
              Contact.sequelize.col('createdAt'),
              '%Y-%m'
            ),
            'month',
          ],
          [Contact.sequelize.fn('COUNT', '*'), 'count'],
        ],
        group: [
          Contact.sequelize.fn(
            'DATE_FORMAT',
            Contact.sequelize.col('createdAt'),
            '%Y-%m'
          ),
        ],
        order: [
          [
            Contact.sequelize.fn(
              'DATE_FORMAT',
              Contact.sequelize.col('createdAt'),
              '%Y-%m'
            ),
            'DESC',
          ],
        ],
        limit: 12,
      }),
    ])

    res.json({
      success: true,
      data: {
        totalContacts,
        statusStats: {
          new: newContacts,
          read: readContacts,
          replied: repliedContacts,
          closed: closedContacts,
        },
        contactsByType: contactsByType.map((item) => ({
          type: item.projectType,
          count: parseInt(item.dataValues.count),
        })),
        contactsByPriority: contactsByPriority.map((item) => ({
          priority: item.priority,
          count: parseInt(item.dataValues.count),
        })),
        contactsByMonth: contactsByMonth.map((item) => ({
          month: item.dataValues.month,
          count: parseInt(item.dataValues.count),
        })),
      },
    })
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques',
    })
  }
}

// Répondre à un contact
exports.replyToContact = async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message requis',
      })
    }

    const contact = await Contact.findByPk(id)

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé',
      })
    }

    // Envoyer la réponse par email
    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: generateReplyHTML(contact, message),
    })

    // Mettre à jour le contact
    await contact.update({
      status: 'replied',
      isRead: true,
      notes: message,
    })

    res.json({
      success: true,
      data: { contact },
      message: 'Réponse envoyée avec succès',
    })
  } catch (error) {
    logger.error("Erreur lors de l'envoi de la réponse:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'envoi de la réponse",
    })
  }
}

// Générateur HTML pour la réponse
const generateReplyHTML = (contact, message) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <p style="color: #666; font-size: 16px;">Bonjour ${contact.name},</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
      ${message.replace(/\n/g, '<br>')}
    </div>
    <p style="color: #666; font-size: 16px;">
      Cordialement,<br>
      <strong>L'équipe</strong>
    </p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <div style="color: #999; font-size: 14px;">
      <p><strong>Votre message original:</strong></p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-style: italic;">
        ${contact.message.replace(/\n/g, '<br>')}
      </div>
    </div>
  </div>
`

// Marquer plusieurs contacts comme lus
exports.markAsRead = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs invalides ou vides',
      })
    }

    // Validation des IDs
    const validIds = ids.filter((id) => !isNaN(id) && id > 0)
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun ID valide fourni',
      })
    }

    const [updatedCount] = await Contact.update(
      { status: 'read', isRead: true },
      { where: { id: { [Op.in]: validIds } } }
    )

    res.json({
      success: true,
      message: `${updatedCount} contact(s) marqué(s) comme lu(s)`,
      updatedCount,
    })
  } catch (error) {
    logger.error('Erreur lors de la mise à jour:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour',
    })
  }
}

// Nouvelle fonction: Supprimer plusieurs contacts
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs invalides ou vides',
      })
    }

    const validIds = ids.filter((id) => !isNaN(id) && id > 0)
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun ID valide fourni',
      })
    }

    const deletedCount = await Contact.destroy({
      where: { id: { [Op.in]: validIds } },
    })

    res.json({
      success: true,
      message: `${deletedCount} contact(s) supprimé(s)`,
      deletedCount,
    })
  } catch (error) {
    logger.error('Erreur lors de la suppression en lot:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression en lot',
    })
  }
}

// module.exports = {
//   getContactById,
//   createContact,
//   updateContact,
//   deleteContact,
//   getContactStats,
//   replyToContact,
//   markAsRead,
//   bulkDelete,
// }
