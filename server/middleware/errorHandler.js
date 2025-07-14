// middleware/errorHandler.js
const logger = require('./logger')

// Classe d'erreur personnalisée
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Middleware pour gérer les erreurs de cast MongoDB
const handleCastErrorDB = (err) => {
  const message = `Ressource non trouvée avec l'ID: ${err.value}`
  return new AppError(message, 400)
}

// Middleware pour gérer les erreurs de validation MongoDB
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message)
  const message = `Données invalides: ${errors.join('. ')}`
  return new AppError(message, 400)
}

// Middleware pour gérer les erreurs de duplication MongoDB
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Valeur dupliquée ${value}. Veuillez utiliser une autre valeur.`
  return new AppError(message, 400)
}

// Middleware pour gérer les erreurs JWT
const handleJWTError = () =>
  new AppError('Token invalide. Veuillez vous connecter à nouveau.', 401)

const handleJWTExpiredError = () =>
  new AppError('Token expiré. Veuillez vous connecter à nouveau.', 401)

// Envoyer les erreurs en mode développement
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })
  }

  // Erreur rendue
  console.error('ERROR 💥', err)
  return res.status(err.statusCode).render('error', {
    title: "Quelque chose s'est mal passé!",
    msg: err.message,
  })
}

// Envoyer les erreurs en mode production
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Erreur opérationnelle, message de confiance à envoyer au client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    }

    // Erreur de programmation: ne pas divulguer les détails de l'erreur
    console.error('ERROR 💥', err)
    return res.status(500).json({
      status: 'error',
      message: "Quelque chose s'est mal passé!",
    })
  }

  // Erreur rendue
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: "Quelque chose s'est mal passé!",
      msg: err.message,
    })
  }

  // Erreur de programmation: ne pas divulguer les détails de l'erreur
  console.error('ERROR 💥', err)
  return res.status(err.statusCode).render('error', {
    title: "Quelque chose s'est mal passé!",
    msg: 'Veuillez réessayer plus tard.',
  })
}

// Middleware global de gestion des erreurs
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  // Log l'erreur
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else {
    let error = { ...err }
    error.message = err.message

    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()

    sendErrorProd(error, req, res)
  }
}

// Middleware pour gérer les routes non trouvées
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Route ${req.originalUrl} non trouvée`, 404)
  next(err)
}

// Middleware pour gérer les erreurs d'upload de fichiers
const multerErrorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Fichier trop volumineux',
    })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Trop de fichiers',
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Champ de fichier inattendu',
    })
  }

  next(err)
}

// Wrapper pour les fonctions async (évite les try/catch)
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = {
  AppError,
  globalErrorHandler,
  notFoundHandler,
  multerErrorHandler,
  asyncHandler,
}
