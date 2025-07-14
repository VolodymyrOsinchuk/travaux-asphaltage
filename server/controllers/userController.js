const { User } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { sendEmail } = require('../utils/email')

// Obtenir tous les utilisateurs avec pagination et filtres
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      isActive = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = req.query

    const offset = (page - 1) * limit
    const whereConditions = {}

    // Filtres de recherche
    if (search) {
      whereConditions[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ]
    }

    if (role) {
      whereConditions.role = role
    }

    if (isActive !== '') {
      whereConditions.isActive = isActive === 'true'
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: {
        exclude: [
          'password',
          'refreshToken',
          'resetPasswordToken',
          'emailVerificationToken',
          'twoFactorSecret',
        ],
      },
    })

    const totalPages = Math.ceil(count / limit)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs',
    })
  }
}

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: {
        exclude: [
          'password',
          'refreshToken',
          'resetPasswordToken',
          'emailVerificationToken',
          'twoFactorSecret',
        ],
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'utilisateur",
    })
  }
}

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role = 'user',
      isActive = true,
      phoneNumber,
      dateOfBirth,
      timezone,
      language,
    } = req.body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? 'Un utilisateur avec cet email existe déjà'
            : "Ce nom d'utilisateur est déjà pris",
      })
    }

    // Générer un token de vérification email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Créer le nouvel utilisateur
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      isActive,
      phoneNumber,
      dateOfBirth,
      timezone,
      language,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
    })

    // Envoyer l'email de vérification (optionnel)
    if (isActive) {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`

      try {
        await sendEmail({
          to: user.email,
          subject: 'Bienvenue - Vérification de votre compte',
          html: `
            <h2>Bienvenue ${user.firstName} !</h2>
            <p>Votre compte a été créé par un administrateur. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
            <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
            <p>Ce lien expire dans 24 heures.</p>
          `,
        })
      } catch (emailError) {
        console.warn("Erreur lors de l'envoi de l'email:", emailError)
      }
    }

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { user: user.toJSON() },
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création de l'utilisateur",
    })
  }
}

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
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
    const {
      username,
      email,
      firstName,
      lastName,
      role,
      isActive,
      phoneNumber,
      dateOfBirth,
      timezone,
      language,
      permissions,
    } = req.body

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // Empêcher la modification de son propre statut actif
    if (user.id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte',
      })
    }

    // Vérifier l'unicité de l'email et du username
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [{ email }, { username }],
        },
      })

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            existingUser.email === email
              ? 'Un utilisateur avec cet email existe déjà'
              : "Ce nom d'utilisateur est déjà pris",
        })
      }
    }

    const updateData = {
      username,
      firstName,
      lastName,
      role,
      isActive,
      phoneNumber,
      dateOfBirth,
      timezone,
      language,
      permissions,
    }

    // Si l'email change, marquer comme non vérifié
    if (email !== user.email) {
      updateData.email = email
      updateData.isEmailVerified = false
      updateData.emailVerificationToken = crypto.randomBytes(32).toString('hex')
      updateData.emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      )
    }

    await user.update(updateData)

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user: user.toJSON() },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour de l'utilisateur",
    })
  }
}

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // Empêcher la suppression de son propre compte
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
      })
    }

    await user.destroy()

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression de l'utilisateur",
    })
  }
}

// Réinitialiser le mot de passe d'un utilisateur
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword, sendEmail: shouldSendEmail = true } = req.body

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // Générer un mot de passe temporaire si non fourni
    const tempPassword = newPassword || crypto.randomBytes(12).toString('hex')

    await user.update({
      password: tempPassword,
      refreshToken: null, // Invalider les sessions existantes
    })

    // Envoyer le nouveau mot de passe par email
    if (shouldSendEmail) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe',
          html: `
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Votre mot de passe a été réinitialisé par un administrateur.</p>
            <p><strong>Nouveau mot de passe temporaire :</strong> ${tempPassword}</p>
            <p>Veuillez vous connecter et changer votre mot de passe dès que possible.</p>
            <p>Pour des raisons de sécurité, ce mot de passe temporaire doit être changé lors de votre prochaine connexion.</p>
          `,
        })
      } catch (emailError) {
        console.warn("Erreur lors de l'envoi de l'email:", emailError)
      }
    }

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      data: newPassword ? undefined : { temporaryPassword: tempPassword },
    })
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la réinitialisation du mot de passe',
    })
  }
}

// Activer/Désactiver un utilisateur
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const user = await User.findByPk(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    // Empêcher la désactivation de son propre compte
    if (user.id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte',
      })
    }

    await user.update({ isActive })

    // Invalider les sessions si désactivé
    if (!isActive) {
      await user.update({ refreshToken: null })
    }

    res.json({
      success: true,
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { user: user.toJSON() },
    })
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de statut',
    })
  }
}

// Obtenir les statistiques des utilisateurs
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { isActive: true } })
    const inactiveUsers = await User.count({ where: { isActive: false } })
    const verifiedUsers = await User.count({ where: { isEmailVerified: true } })
    const unverifiedUsers = await User.count({
      where: { isEmailVerified: false },
    })

    const roleStats = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count'],
      ],
      group: 'role',
      raw: true,
    })

    // Utilisateurs récents (7 derniers jours)
    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        recentUsers,
        roleStats: roleStats.reduce((acc, curr) => {
          acc[curr.role] = parseInt(curr.count)
          return acc
        }, {}),
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

// Rechercher des utilisateurs
exports.searchUsers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La recherche doit contenir au moins 2 caractères',
      })
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
          { username: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
        ],
      },
      limit: parseInt(limit),
      attributes: [
        'id',
        'firstName',
        'lastName',
        'username',
        'email',
        'role',
        'isActive',
      ],
      order: [['firstName', 'ASC']],
    })

    res.json({
      success: true,
      data: { users },
    })
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la recherche',
    })
  }
}

// Obtenir les utilisateurs par rôle
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params
    const { page = 1, limit = 10 } = req.query

    const validRoles = ['admin', 'user', 'moderator']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide',
      })
    }

    const offset = (page - 1) * limit

    const { count, rows: users } = await User.findAndCountAll({
      where: { role },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: [
          'password',
          'refreshToken',
          'resetPasswordToken',
          'emailVerificationToken',
          'twoFactorSecret',
        ],
      },
    })

    const totalPages = Math.ceil(count / limit)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des utilisateurs par rôle:',
      error
    )
    res.status(500).json({
      success: false,
      message:
        'Erreur serveur lors de la récupération des utilisateurs par rôle',
    })
  }
}
