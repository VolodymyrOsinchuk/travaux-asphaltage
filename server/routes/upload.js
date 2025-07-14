// server/routes/upload.js
const express = require('express')
const router = express.Router()
const {
  uploadLimiter,
  uploadImage,
  uploadDocument,
  uploadSingleImage,
  uploadMultipleImages,
  uploadDocumentController,
  deleteFile,
  getFileInfo,
  listFiles,
  handleMulterError,
} = require('../controllers/uploadController')
const {
  authenticateToken,
  requireRole,
  optionalAuth,
  rateLimitByUser,
} = require('../middleware/auth')

// Middleware de rate limiting pour toutes les routes d'upload
router.use(uploadLimiter)

// Routes pour les images
router.post(
  '/image',
  authenticateToken,
  uploadImage.single('image'),
  handleMulterError,
  uploadSingleImage
)

router.post(
  '/images',
  authenticateToken,
  uploadImage.array('images', 10),
  handleMulterError,
  uploadMultipleImages
)

// Routes pour les documents
router.post(
  '/document',
  authenticateToken,
  uploadDocument.single('document'),
  handleMulterError,
  uploadDocumentController
)

// Routes de gestion des fichiers
router.delete('/file/:publicId', authenticateToken, deleteFile)
router.get('/file/:publicId', authenticateToken, getFileInfo)
router.get('/files', authenticateToken, listFiles)

// Route pour générer des URLs signées
router.post('/signed-url', authenticateToken, async (req, res) => {
  try {
    const { publicId, transformation } = req.body

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID requis',
      })
    }

    const { cloudinary } = require('../config/cloudinary')
    const timestamp = Math.round(new Date().getTime() / 1000)

    const params = {
      public_id: publicId,
      timestamp,
      ...transformation,
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    )

    res.json({
      success: true,
      signedUrl: cloudinary.url(publicId, {
        ...transformation,
        sign_url: true,
        auth_token: {
          key: process.env.CLOUDINARY_API_KEY,
          duration: 3600, // 1 heure
          start_time: timestamp,
        },
      }),
    })
  } catch (error) {
    console.error('Erreur génération URL signée:', error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération de l'URL signée",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// Route pour obtenir les paramètres d'upload direct
router.get('/params', authenticateToken, async (req, res) => {
  try {
    const { folder, resourceType = 'image' } = req.query
    const { cloudinary } = require('../config/cloudinary')

    const timestamp = Math.round(new Date().getTime() / 1000)
    const params = {
      timestamp,
      folder: folder || 'uploads',
      resource_type: resourceType,
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    )

    res.json({
      success: true,
      params: {
        ...params,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      },
    })
  } catch (error) {
    console.error('Erreur génération paramètres upload:', error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération des paramètres d'upload",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// Route pour valider un fichier avant upload
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { filename, size, type } = req.body

    if (!filename || !size || !type) {
      return res.status(400).json({
        success: false,
        message: 'Informations de fichier manquantes',
      })
    }

    // Validation de la taille (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB en bytes
    if (size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 10MB)',
      })
    }

    // Validation du type MIME
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
    }

    const isImageType = allowedTypes.image.includes(type)
    const isDocumentType = allowedTypes.document.includes(type)

    if (!isImageType && !isDocumentType) {
      return res.status(400).json({
        success: false,
        message: 'Type de fichier non autorisé',
      })
    }

    res.json({
      success: true,
      message: 'Fichier valide',
      fileType: isImageType ? 'image' : 'document',
    })
  } catch (error) {
    console.error('Erreur validation fichier:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du fichier',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

module.exports = router
