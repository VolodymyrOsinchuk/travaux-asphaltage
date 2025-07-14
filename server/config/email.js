// utils/email.js
const nodemailer = require('nodemailer')

// Configuration du transporteur email
const createTransporter = () => {
  // Configuration pour différents services email
  const emailService = process.env.EMAIL_SERVICE || 'gmail'

  let transporterConfig = {}

  switch (emailService.toLowerCase()) {
    case 'gmail':
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Mot de passe d'application Gmail
        },
      }
      break

    case 'outlook':
      transporterConfig = {
        service: 'outlook',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
      break

    case 'smtp':
      transporterConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
      break

    case 'sendgrid':
      transporterConfig = {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      }
      break

    default:
      throw new Error(`Service email non supporté: ${emailService}`)
  }

  return nodemailer.createTransporter(transporterConfig)
}

// Fonction pour envoyer un email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Votre Application',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    }

    // Vérifier la configuration du transporteur
    await transporter.verify()

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions)

    console.log('Email envoyé avec succès:', info.messageId)

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)

    // Relancer l'erreur pour que le code appelant puisse la gérer
    throw new Error(`Erreur d'envoi email: ${error.message}`)
  }
}

// Fonction pour envoyer un email de bienvenue
const sendWelcomeEmail = async (user) => {
  const subject = `Bienvenue ${user.firstName} !`
  const text = `Bonjour ${user.firstName},\n\nBienvenue sur notre plateforme ! Votre compte a été créé avec succès.\n\nCordialement,\nL'équipe`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Bienvenue ${user.firstName} !</h1>
      <p style="color: #666; font-size: 16px;">Bonjour ${user.firstName},</p>
      <p style="color: #666; font-size: 16px;">Bienvenue sur notre plateforme ! Votre compte a été créé avec succès.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Informations de votre compte :</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Nom d'utilisateur :</strong> ${user.username}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Email :</strong> ${user.email}</p>
        <p style="color: #666; margin: 5px 0;"><strong>Rôle :</strong> ${user.role}</p>
      </div>
      <p style="color: #666; font-size: 16px;">N'hésitez pas à nous contacter si vous avez des questions.</p>
      <p style="color: #666; font-size: 16px;">Cordialement,<br>L'équipe</p>
    </div>
  `

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  })
}

// Fonction pour envoyer un email de notification de changement de mot de passe
const sendPasswordChangeNotification = async (user) => {
  const subject = 'Mot de passe modifié'
  const text = `Bonjour ${user.firstName},\n\nVotre mot de passe a été modifié avec succès.\n\nSi vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.\n\nCordialement,\nL'équipe`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Mot de passe modifié</h1>
      <p style="color: #666; font-size: 16px;">Bonjour ${user.firstName},</p>
      <p style="color: #666; font-size: 16px;">Votre mot de passe a été modifié avec succès.</p>
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #856404; margin: 0;"><strong>⚠️ Important :</strong> Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.</p>
      </div>
      <p style="color: #666; font-size: 16px;">Cordialement,<br>L'équipe</p>
    </div>
  `

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  })
}

// Fonction pour envoyer un email de notification de connexion suspecte
const sendSuspiciousLoginNotification = async (user, loginInfo) => {
  const subject = 'Connexion détectée'
  const text = `Bonjour ${user.firstName},\n\nUne connexion à votre compte a été détectée.\n\nDétails:\n- Date: ${loginInfo.date}\n- IP: ${loginInfo.ip}\n- Appareil: ${loginInfo.device}\n\nSi ce n'est pas vous, changez immédiatement votre mot de passe.\n\nCordialement,\nL'équipe`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; text-align: center;">Connexion détectée</h1>
      <p style="color: #666; font-size: 16px;">Bonjour ${user.firstName},</p>
      <p style="color: #666; font-size: 16px;">Une connexion à votre compte a été détectée.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Détails de la connexion :</h3>
        <p style="color: #666; margin: 5px 0;"><strong>Date :</strong> ${
          loginInfo.date
        }</p>
        <p style="color: #666; margin: 5px 0;"><strong>Adresse IP :</strong> ${
          loginInfo.ip
        }</p>
        <p style="color: #666; margin: 5px 0;"><strong>Appareil :</strong> ${
          loginInfo.device
        }</p>
        <p style="color: #666; margin: 5px 0;"><strong>Localisation :</strong> ${
          loginInfo.location || 'Non disponible'
        }</p>
      </div>
      <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #721c24; margin: 0;"><strong>🔒 Sécurité :</strong> Si ce n'est pas vous, changez immédiatement votre mot de passe et contactez-nous.</p>
      </div>
      <p style="color: #666; font-size: 16px;">Cordialement,<br>L'équipe</p>
    </div>
  `

  return await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  })
}

// Fonction pour valider les options d'email
const validateEmailOptions = (options) => {
  if (!options.to) {
    throw new Error("L'adresse destinataire est requise")
  }

  if (!options.subject) {
    throw new Error('Le sujet est requis')
  }

  if (!options.text && !options.html) {
    throw new Error('Le contenu text ou html est requis')
  }

  // Validation simple de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(options.to)) {
    throw new Error('Adresse email invalide')
  }
}

// Fonction pour envoyer des emails en lot (avec limitation)
const sendBulkEmails = async (emailList, options = {}) => {
  const { batchSize = 10, delay = 1000 } = options
  const results = []

  for (let i = 0; i < emailList.length; i += batchSize) {
    const batch = emailList.slice(i, i + batchSize)
    const batchPromises = batch.map(async (emailOptions) => {
      try {
        validateEmailOptions(emailOptions)
        return await sendEmail(emailOptions)
      } catch (error) {
        return {
          success: false,
          error: error.message,
          recipient: emailOptions.to,
        }
      }
    })

    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults)

    // Délai entre les lots pour éviter le spam
    if (i + batchSize < emailList.length) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  return results
}

// Fonction pour tester la configuration email
const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('Configuration email valide')
    return { success: true, message: 'Configuration email valide' }
  } catch (error) {
    console.error('Configuration email invalide:', error)
    return {
      success: false,
      message: `Configuration email invalide: ${error.message}`,
    }
  }
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordChangeNotification,
  sendSuspiciousLoginNotification,
  sendBulkEmails,
  testEmailConfiguration,
  validateEmailOptions,
}
