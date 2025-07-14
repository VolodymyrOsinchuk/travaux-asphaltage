// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const path = require('path')

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS
})

// Configuration du stockage pour les images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [
      {
        width: 1920,
        height: 1080,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      },
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      return `image-${uniqueSuffix}`
    },
  },
})

// Configuration du stockage pour les documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    resource_type: 'auto',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const name = path
        .parse(file.originalname)
        .name.replace(/[^a-zA-Z0-9]/g, '_')
      return `doc-${name}-${uniqueSuffix}`
    },
  },
})

// Fonction utilitaire pour générer les URLs optimisées
const generateOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options,
  }
  return cloudinary.url(publicId, defaultOptions)
}

// Fonction pour supprimer un fichier de Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
    return result
  } catch (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`)
  }
}

// Fonction pour obtenir les informations d'un fichier
const getFileInfo = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    })
    return result
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des informations: ${error.message}`
    )
  }
}

// Fonction pour lister les fichiers
const listFiles = async (
  folder = 'uploads',
  resourceType = 'image',
  maxResults = 50
) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix: folder,
      max_results: maxResults,
      context: true,
    })
    return result
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de la liste: ${error.message}`
    )
  }
}

module.exports = {
  cloudinary,
  imageStorage,
  documentStorage,
  generateOptimizedUrl,
  deleteFromCloudinary,
  getFileInfo,
  listFiles,
}
