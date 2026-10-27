// server/routes/quotes.js - Routes pour les demandes de devis
const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const rateLimit = require('express-rate-limit')

const { Quote } = require('../models')

// Rate limiting pour les soumissions de devis
const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 soumissions par IP
  message: {
    success: false,
    message: 'Trop de demandes de devis. Veuillez réessayer dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation pour la création de devis
const validateQuote = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage(
      'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
    ),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)\.]{8,20}$/)
    .withMessage('Numéro de téléphone invalide'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nom de société trop long (max 100 caractères)'),
  body('projectDescription')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage(
      'La description du projet doit contenir entre 20 et 2000 caractères'
    ),
  body('budget')
    .isIn([
      '< 1000',
      '1000-5000',
      '5000-10000',
      '10000-25000',
      '> 25000',
    ])
    .withMessage('Budget invalide'),
  body('timeline')
    .isIn([
      'urgent',
      '1-2 weeks',
      '1 month',
      '2-3 months',
      '> 3 months',
    ])
    .withMessage('Délai invalide'),
  body('projectType')
    .isIn(['website', 'mobile_app', 'web_app', 'ecommerce', 'other'])
    .withMessage('Type de projet invalide'),
]

// Route publique - Créer une demande de devis
router.post('/', quoteLimiter, validateQuote, async (req, res) => {
  try {
    const quote = await Quote.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || null,
      company: req.body.company || null,
      projectDescription: req.body.projectDescription,
      budget: req.body.budget,
      timeline: req.body.timeline,
      projectType: req.body.projectType,
      status: 'pending',
    })

    res.status(201).json({
      success: true,
      data: { quote },
      message: 'Demande de devis envoyée avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi de la demande de devis',
    })
  }
})

module.exports = router
