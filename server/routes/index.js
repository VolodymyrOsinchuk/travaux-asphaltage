// routes/index.js - Routes principales
const express = require('express')
const router = express.Router()

// Route de santé de l'API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// Route d'accueil de l'API
router.get('/', (req, res) => {
  res.json({
    message: 'API Portfolio - Bienvenue',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      projects: '/api/projects',
      testimonials: '/api/testimonials',
      contacts: '/api/contacts',
      blog: '/api/blog',
      upload: '/api/upload',
    },
  })
})

module.exports = router
