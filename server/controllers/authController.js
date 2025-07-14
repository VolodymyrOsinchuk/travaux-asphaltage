const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { User } = require('../models')
const { sendEmail } = require('../utils/email')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Fonction pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  })
}

// Fonction pour générer un refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

// Fonction pour générer un token de vérification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Inscription d'un nouvel utilisateur admin
exports.register = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
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
      role = 'admin',
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
    const emailVerificationToken = generateVerificationToken()
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Créer le nouvel utilisateur
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      emailVerificationToken,
      emailVerificationExpires,
      isEmailVerified: false,
    })

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`

    // await sendEmail({
    //   to: user.email,
    //   subject: 'Vérification de votre adresse email',
    //   text: `Bienvenue ! Veuillez vérifier votre adresse email en cliquant sur ce lien: ${verificationUrl}`,
    //   html: `
    //     <h2>Bienvenue ${user.firstName} !</h2>
    //     <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
    //     <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
    //     <p>Ce lien expire dans 24 heures.</p>
    //     <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    //   `,
    // })

    // Supprimer le mot de passe de la réponse
    const userResponse = user.toJSON()
    delete userResponse.password

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès. Veuillez vérifier votre email.',
      data: {
        user: userResponse,
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
    })
  }
}

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Rechercher l'utilisateur AVEC le mot de passe
    const user = await User.scope('withPassword').findOne({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.validatePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    // Générer les tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken()

    // Mettre à jour la dernière connexion et le refresh token
    await user.update({
      lastLogin: new Date(),
      refreshToken,
    })

    // Supprimer le mot de passe de la réponse
    const userResponse = user.toJSON()
    delete userResponse.password

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
    })
  }
}

// Rafraîchir le token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token manquant',
      })
    }

    // Rechercher l'utilisateur avec ce refresh token
    const user = await User.findOne({ where: { refreshToken } })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalide',
      })
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé',
      })
    }

    // Générer un nouveau token
    const newToken = generateToken(user.id)
    const newRefreshToken = generateRefreshToken()

    // Mettre à jour le refresh token
    await user.update({ refreshToken: newRefreshToken })

    res.json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du rafraîchissement du token',
    })
  }
}

// Déconnexion
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id

    if (userId) {
      // Supprimer le refresh token
      await User.update({ refreshToken: null }, { where: { id: userId } })
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    })
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la déconnexion',
    })
  }
}

// Obtenir le profil de l'utilisateur connecté
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password', 'refreshToken', 'resetPasswordToken'],
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
      data: {
        user: user.toJSON(),
      },
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil',
    })
  }
}

// Mettre à jour le profil
exports.updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const { firstName, lastName, username, email } = req.body
    const userId = req.user.id

    // Vérifier si l'email ou le username existe déjà pour un autre utilisateur
    const existingUser = await User.findOne({
      where: {
        id: { [Op.ne]: userId },
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

    // Mettre à jour l'utilisateur
    const user = await User.findByPk(userId)

    const updateData = {
      firstName,
      lastName,
      username,
    }

    // Si l'email change, il faut revérifier
    if (email !== user.email) {
      updateData.email = email
      updateData.isEmailVerified = false
      updateData.emailVerificationToken = generateVerificationToken()
      updateData.emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      )

      // Envoyer email de vérification
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${updateData.emailVerificationToken}`

      await sendEmail({
        to: email,
        subject: 'Vérification de votre nouvelle adresse email',
        text: `Veuillez vérifier votre nouvelle adresse email en cliquant sur ce lien: ${verificationUrl}`,
        html: `
          <h2>Vérification de votre nouvelle adresse email</h2>
          <p>Vous avez modifié votre adresse email. Veuillez la vérifier en cliquant sur le lien ci-dessous :</p>
          <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
          <p>Ce lien expire dans 24 heures.</p>
        `,
      })
    }

    await user.update(updateData)

    const userResponse = user.toJSON()
    delete userResponse.password

    res.json({
      success: true,
      message:
        email !== user.email
          ? 'Profil mis à jour avec succès. Veuillez vérifier votre nouvel email.'
          : 'Profil mis à jour avec succès',
      data: {
        user: userResponse,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil',
    })
  }
}

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array(),
      })
    }

    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // Récupérer l'utilisateur
    const user = await User.findByPk(userId)

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.validatePassword(currentPassword)

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      })
    }

    // Mettre à jour le mot de passe
    await user.update({ password: newPassword })

    // Invalider tous les refresh tokens existants pour forcer une nouvelle connexion
    await user.update({ refreshToken: null })

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de mot de passe',
    })
  }
}

// Demande de réinitialisation de mot de passe
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email',
      })
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    })

    // Envoyer l'email de réinitialisation
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`,
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p><a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
      `,
    })

    res.json({
      success: true,
      message: 'Email de réinitialisation envoyé',
    })
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la demande de réinitialisation',
    })
  }
}

// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { newPassword } = req.body

    // Rechercher l'utilisateur avec le token valide
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré',
      })
    }

    // Mettre à jour le mot de passe et supprimer les tokens
    await user.update({
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null, // Invalider le refresh token
    })

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la réinitialisation',
    })
  }
}

// Vérifier l'email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    // Rechercher l'utilisateur avec le token valide
    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [Op.gt]: new Date(),
        },
      },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de vérification invalide ou expiré',
      })
    }

    // Marquer l'email comme vérifié
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    })

    res.json({
      success: true,
      message: 'Email vérifié avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la vérification email:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification email',
    })
  }
}

// Renvoyer l'email de vérification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà vérifié',
      })
    }

    // Générer un nouveau token de vérification
    const verificationToken = generateVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    })

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`

    await sendEmail({
      to: user.email,
      subject: 'Vérification de votre adresse email',
      text: `Veuillez vérifier votre adresse email en cliquant sur ce lien: ${verificationUrl}`,
      html: `
        <h2>Vérification de votre adresse email</h2>
        <p>Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
        <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    })

    res.json({
      success: true,
      message: 'Email de vérification renvoyé',
    })
  } catch (error) {
    console.error('Erreur lors du renvoi de vérification:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du renvoi de vérification',
    })
  }
}
