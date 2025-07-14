// server/controllers/uploadController.js
const multer = require('multer')
const path = require('path')
const rateLimit = require('express-rate-limit')
const { v4: uuidv4 } = require('uuid')
const {
  cloudinary,
  imageStorage,
  documentStorage,
  generateOptimizedUrl,
  deleteFromCloudinary,
  getFileInfo,
  listFiles,
} = require('../config/cloudinary')

// Configuration des limites de taux
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads par fenêtre
  message: {
    success: false,
    message: "Trop de tentatives d'upload. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Filtres pour les types de fichiers avec validation MIME renforcée
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]

  const allowedExts = /jpeg|jpg|png|gif|webp|svg/
  const extname = allowedExts.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimetype = allowedMimes.includes(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(
      new Error(
        "Format d'image non supporté. Formats acceptés: JPEG, PNG, GIF, WebP, SVG"
      )
    )
  }
}

const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
  ]

  const allowedExts = /pdf|doc|docx|txt|rtf/
  const extname = allowedExts.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimetype = allowedMimes.includes(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(
      new Error(
        'Format de document non supporté. Formats acceptés: PDF, DOC, DOCX, TXT, RTF'
      )
    )
  }
}

// Configuration multer pour les images
const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
})

// Configuration multer pour les documents
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 5,
  },
})

// Fonction utilitaire pour valider les métadonnées
const validateMetadata = (file) => {
  const maxFilenameLength = 255
  const sanitizedName = file.originalname.replace(/[<>:"/\\|?*]/g, '_')

  if (sanitizedName.length > maxFilenameLength) {
    throw new Error('Nom de fichier trop long')
  }

  return {
    originalName: sanitizedName,
    size: file.size,
    mimetype: file.mimetype,
  }
}

// Contrôleur pour upload d'une seule image
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      })
    }

    const metadata = validateMetadata(req.file)

    // Générer différentes tailles d'image
    const variants = {
      thumbnail: generateOptimizedUrl(req.file.filename, {
        width: 150,
        height: 150,
        crop: 'thumb',
        gravity: 'auto',
      }),
      medium: generateOptimizedUrl(req.file.filename, {
        width: 800,
        height: 600,
        crop: 'limit',
      }),
      large: generateOptimizedUrl(req.file.filename, {
        width: 1920,
        height: 1080,
        crop: 'limit',
      }),
      original: req.file.path,
    }

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      file: {
        id: req.file.filename,
        originalName: metadata.originalName,
        size: metadata.size,
        mimetype: metadata.mimetype,
        url: req.file.path,
        variants,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload de l'image",
      error: error.message,
    })
  }
}

// Contrôleur pour upload de plusieurs images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      })
    }

    const processedFiles = []
    const errors = []

    for (const file of req.files) {
      try {
        const metadata = validateMetadata(file)

        const variants = {
          thumbnail: generateOptimizedUrl(file.filename, {
            width: 150,
            height: 150,
            crop: 'thumb',
            gravity: 'auto',
          }),
          medium: generateOptimizedUrl(file.filename, {
            width: 800,
            height: 600,
            crop: 'limit',
          }),
          large: generateOptimizedUrl(file.filename, {
            width: 1920,
            height: 1080,
            crop: 'limit',
          }),
          original: file.path,
        }

        processedFiles.push({
          id: file.filename,
          originalName: metadata.originalName,
          size: metadata.size,
          mimetype: metadata.mimetype,
          url: file.path,
          variants,
          uploadedAt: new Date().toISOString(),
        })
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message,
        })
      }
    }

    const response = {
      success: true,
      message: `${processedFiles.length} image(s) uploadée(s) avec succès`,
      files: processedFiles,
    }

    if (errors.length > 0) {
      response.errors = errors
      response.message += ` (${errors.length} erreur(s))`
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload des images",
      error: error.message,
    })
  }
}

// Contrôleur pour upload de documents
const uploadDocumentController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
      })
    }

    const metadata = validateMetadata(req.file)

    res.json({
      success: true,
      message: 'Document uploadé avec succès',
      file: {
        id: req.file.filename,
        originalName: metadata.originalName,
        size: metadata.size,
        mimetype: metadata.mimetype,
        url: req.file.path,
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload du document",
      error: error.message,
    })
  }
}

// Contrôleur pour supprimer un fichier
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params
    const { type = 'image' } = req.query

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'ID public du fichier requis',
      })
    }

    const resourceType = type === 'document' ? 'auto' : 'image'
    const result = await deleteFromCloudinary(publicId, resourceType)

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Fichier supprimé avec succès',
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'Fichier non trouvé',
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: error.message,
    })
  }
}

// Contrôleur pour obtenir les informations d'un fichier
const getFileInfoController = async (req, res) => {
  try {
    const { publicId } = req.params
    const { type = 'image' } = req.query

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'ID public du fichier requis',
      })
    }

    const resourceType = type === 'document' ? 'auto' : 'image'
    const fileInfo = await getFileInfo(publicId, resourceType)

    const response = {
      success: true,
      file: {
        id: fileInfo.public_id,
        originalName: fileInfo.original_filename || 'unknown',
        size: fileInfo.bytes,
        mimetype: fileInfo.format,
        url: fileInfo.secure_url,
        width: fileInfo.width,
        height: fileInfo.height,
        createdAt: fileInfo.created_at,
        resourceType: fileInfo.resource_type,
      },
    }

    // Ajouter les variantes pour les images
    if (resourceType === 'image') {
      response.file.variants = {
        thumbnail: generateOptimizedUrl(publicId, {
          width: 150,
          height: 150,
          crop: 'thumb',
          gravity: 'auto',
        }),
        medium: generateOptimizedUrl(publicId, {
          width: 800,
          height: 600,
          crop: 'limit',
        }),
        large: generateOptimizedUrl(publicId, {
          width: 1920,
          height: 1080,
          crop: 'limit',
        }),
      }
    }

    res.json(response)
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        message: 'Fichier non trouvé',
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des informations du fichier',
        error: error.message,
      })
    }
  }
}

// Contrôleur pour lister les fichiers
const listFilesController = async (req, res) => {
  try {
    const {
      type = 'image',
      folder = 'uploads',
      limit = 50,
      next_cursor,
    } = req.query

    const resourceType = type === 'document' ? 'auto' : 'image'
    const fullFolder = `${folder}/${
      type === 'document' ? 'documents' : 'images'
    }`

    const options = {
      type: 'upload',
      resource_type: resourceType,
      prefix: fullFolder,
      max_results: Math.min(parseInt(limit), 100),
      context: true,
    }

    if (next_cursor) {
      options.next_cursor = next_cursor
    }

    const result = await cloudinary.api.resources(options)

    const files = result.resources.map((file) => ({
      id: file.public_id,
      originalName: file.original_filename || 'unknown',
      size: file.bytes,
      mimetype: file.format,
      url: file.secure_url,
      width: file.width,
      height: file.height,
      createdAt: file.created_at,
      resourceType: file.resource_type,
    }))

    res.json({
      success: true,
      files,
      pagination: {
        total: result.total_count,
        hasMore: !!result.next_cursor,
        nextCursor: result.next_cursor,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la liste des fichiers',
      error: error.message,
    })
  }
}

// Middleware de gestion d'erreurs Multer amélioré
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = "Erreur d'upload"
    let statusCode = 400

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Le fichier est trop volumineux'
        break
      case 'LIMIT_FILE_COUNT':
        message = 'Trop de fichiers'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Champ de fichier inattendu'
        break
      case 'LIMIT_FIELD_COUNT':
        message = 'Trop de champs'
        break
      case 'LIMIT_FIELD_KEY':
        message = 'Nom de champ trop long'
        break
      case 'LIMIT_FIELD_VALUE':
        message = 'Valeur de champ trop longue'
        break
      case 'LIMIT_PART_COUNT':
        message = 'Trop de parties'
        break
    }

    return res.status(statusCode).json({
      success: false,
      message,
      code: err.code,
    })
  }

  // Erreurs de validation de fichier
  if (err.message.includes('Format')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // Erreurs Cloudinary
  if (err.message.includes('Cloudinary')) {
    return res.status(500).json({
      success: false,
      message: 'Erreur du service de stockage',
      error:
        process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne',
    })
  }

  next(err)
}

module.exports = {
  uploadLimiter,
  uploadImage,
  uploadDocument,
  uploadSingleImage,
  uploadMultipleImages,
  uploadDocumentController,
  deleteFile,
  getFileInfo: getFileInfoController,
  listFiles: listFilesController,
  handleMulterError,
}
