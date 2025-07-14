// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator')

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreurs de validation',
      details: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    })
  }
  next()
}

// Validations pour l'authentification
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  handleValidationErrors,
]

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  handleValidationErrors,
]

// Validations pour les utilisateurs
const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('phone')
    .optional()
    .isMobilePhone('fr-FR')
    .withMessage('Numéro de téléphone français invalide'),
  handleValidationErrors,
]

// Validation des paramètres d'URL
const validateObjectId = [
  param('id').isMongoId().withMessage('ID invalide'),
  handleValidationErrors,
]

// Validations pour les requêtes avec pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'email'])
    .withMessage('Champ de tri invalide'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre de tri invalide (asc ou desc)'),
  handleValidationErrors,
]

// Validation pour les mots de passe
const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Les mots de passe ne correspondent pas')
    }
    return true
  }),
  handleValidationErrors,
]

// Validation pour les fichiers
const validateFileUpload = (
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'Fichier requis',
      })
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(
          ', '
        )}`,
      })
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'Fichier trop volumineux (max 5MB)',
      })
    }

    next()
  }
}

// Validation personnalisée pour les recherches
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La recherche doit contenir entre 1 et 100 caractères'),
  query('category')
    .optional()
    .isIn(['users', 'products', 'orders'])
    .withMessage('Catégorie de recherche invalide'),
  handleValidationErrors,
]

// Validation pour les dates
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide (format ISO 8601)'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide (format ISO 8601)')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error(
          'La date de fin doit être postérieure à la date de début'
        )
      }
      return true
    }),
  handleValidationErrors,
]

// Validation des paramètres de requête
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'publishedAt', 'title', 'viewCount'])
    .withMessage(
      'Le tri doit être par createdAt, updatedAt, publishedAt, title ou viewCount'
    ),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage("L'ordre doit être ASC ou DESC"),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      'Le terme de recherche doit contenir entre 1 et 100 caractères'
    ),

  query('status')
    .optional()
    .isIn(['draft', 'published', 'scheduled', 'archived'])
    .withMessage('Le statut doit être draft, published, scheduled ou archived'),

  query('published')
    .optional()
    .isBoolean()
    .withMessage('Published doit être un booléen'),

  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured doit être un booléen'),
]

const validateCategory = [
  param('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('La catégorie doit contenir entre 1 et 50 caractères')
    .matches(/^[a-zA-Z0-9\s-_]+$/)
    .withMessage('La catégorie contient des caractères invalides'),
]

const validateTag = [
  param('tag')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Le tag doit contenir entre 1 et 30 caractères')
    .matches(/^[a-zA-Z0-9\s-_]+$/)
    .withMessage('Le tag contient des caractères invalides'),
]

const validateSlug = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 250 })
    .withMessage('Le slug doit contenir entre 1 et 250 caractères')
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    ),
]

// Validation des paramètres d'URL
const validatePostId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage("L'ID doit être un nombre entier positif"),
]

// Validation pour la création d'un article
const validateCreatePost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères')
    .not()
    .isEmpty()
    .withMessage('Le titre est obligatoire'),

  body('slug')
    .optional()
    .trim()
    .isLength({ min: 5, max: 250 })
    .withMessage('Le slug doit contenir entre 5 et 250 caractères')
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    ),

  body('excerpt')
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("L'extrait doit contenir entre 20 et 500 caractères")
    .not()
    .isEmpty()
    .withMessage("L'extrait est obligatoire"),

  body('content')
    .trim()
    .isLength({ min: 100, max: 50000 })
    .withMessage('Le contenu doit contenir entre 100 et 50000 caractères')
    .not()
    .isEmpty()
    .withMessage('Le contenu est obligatoire'),

  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La catégorie doit contenir entre 2 et 50 caractères')
    .not()
    .isEmpty()
    .withMessage('La catégorie est obligatoire'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Chaque tag doit contenir entre 1 et 30 caractères'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'scheduled', 'archived'])
    .withMessage('Le statut doit être draft, published, scheduled ou archived'),

  body('featuredImage')
    .optional()
    .isURL()
    .withMessage("L'image à la une doit être une URL valide"),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),

  body('seoTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Le titre SEO ne peut pas dépasser 60 caractères'),

  body('seoDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('La description SEO ne peut pas dépasser 160 caractères'),

  body('seoKeywords')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Les mots-clés SEO ne peuvent pas dépasser 255 caractères'),

  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('La date de publication doit être au format ISO8601'),
]

// Validation pour la mise à jour d'un article
const validateUpdatePost = [
  ...validateCreatePost.map((validator) => validator.optional()),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le titre doit contenir entre 5 et 200 caractères'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ min: 20, max: 500 })
    .withMessage("L'extrait doit contenir entre 20 et 500 caractères"),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 100, max: 50000 })
    .withMessage('Le contenu doit contenir entre 100 et 50000 caractères'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La catégorie doit contenir entre 2 et 50 caractères'),
]

module.exports = {
  handleValidationErrors,
  validateCategory,
  validateDateRange,
  validateFileUpload,
  validateLogin,
  validateObjectId,
  validatePagination,
  validatePasswordChange,
  validateQueryParams,
  validateRegister,
  validateCreatePost,
  validatePostId,
  validateSearch,
  validateSlug,
  validateTag,
  validateUpdatePost,
  validateUserUpdate,
}
