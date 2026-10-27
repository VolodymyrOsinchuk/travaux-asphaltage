const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

// Import des configurations
const db = require("./models");
// const redisClient = require('./config/redis')

// Import des routes
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/services");
const projectRoutes = require("./routes/projects");
const testimonialRoutes = require("./routes/testimonials");
const contactRoutes = require("./routes/contacts");
const blogRoutes = require("./routes/blog");
const uploadRoutes = require("./routes/upload");
const userRoutes = require("./routes/user");
const quoteRoutes = require("./routes/quotes");

// Import des middleware personnalisés
const {
  globalErrorHandler,
  notFoundHandler,
  multerErrorHandler,
} = require("./middleware/errorHandler");
const { conditionalCors } = require("./middleware/cors");
const {
  generalLimiter,
  authLimiter,
  readLimiter,
  strictLimiter,
  heavyLimiter,
  speedLimiter,
  logRateLimitHit,
} = require("./middleware/rateLimit");
const logger = require("./middleware/logger");

// Création de l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 5000;

// Middleware de sécurité (doit être en premier)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        fontSrc: ["'self'", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Compression des réponses
app.use(compression());

// Configuration CORS avec middleware personnalisé
app.use(conditionalCors);

// Middleware de logging
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });
    next();
  });
}
console.log("process", process.env.NODE_ENV);
console.log("PORT >>>> ", process.env.PORT);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware pour log des rate limits
app.use(logRateLimitHit);

// Speed limiter global (appliqué en premier)
app.use(speedLimiter);

// Rate limiting global pour les API (moins strict)
app.use("/api/", generalLimiter);

// Middleware pour parser les requêtes
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir les fichiers statiques
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    etag: true,
    setHeaders: (res, path) => {
      // Sécurité pour les fichiers uploadés
      res.set("X-Content-Type-Options", "nosniff");
      res.set("X-Frame-Options", "DENY");
    },
  }),
);

// Configuration pour la production
if (process.env.NODE_ENV === "production") {
  // Servir les fichiers statiques du client
  app.use(
    express.static(path.join(__dirname, "../client/dist"), {
      maxAge: "1d",
      etag: true,
      setHeaders: (res, path) => {
        // Cache plus long pour les assets avec hash
        if (path.includes(".") && !path.includes("index.html")) {
          res.set("Cache-Control", "public, max-age=31536000"); // 1 an
        }
      },
    }),
  );
}

// Routes API avec rate limiting spécifique
app.use("/api/v1", readLimiter, indexRoutes);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/services", readLimiter, serviceRoutes);
app.use("/api/v1/projects", readLimiter, projectRoutes);
app.use("/api/v1/testimonials", readLimiter, testimonialRoutes);
app.use("/api/v1/contacts", strictLimiter, contactRoutes);
app.use("/api/v1/blog", readLimiter, blogRoutes);
app.use("/api/v1/upload", uploadRoutes); // Le rate limiting est géré dans le router
app.use("/api/v1/users", userRoutes); // Le rate limiting est géré dans le router
app.use("/api/v1/quotes", quoteRoutes); // Demandes de devis

app.get("/", (req, res) => {
  res.send("Hello from backend travaux asphaltage");
});

// Route de santé (sans rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
    },
  });
});

// Route de métriques (pour monitoring) avec rate limiting strict
app.get("/metrics", strictLimiter, (req, res) => {
  res.status(200).json({
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cpu: process.cpuUsage(),
    version: process.version,
  });
});

// Route pour vérifier les limites de rate (utile pour debug)
app.get("/api/rate-limit-info", generalLimiter, (req, res) => {
  res.json({
    success: true,
    rateLimit: {
      limit: req.rateLimit?.limit,
      remaining: req.rateLimit?.remaining,
      reset: req.rateLimit?.reset,
      resetTime: req.rateLimit?.resetTime,
    },
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
});

// En production, servir l'application React pour toutes les routes frontend
if (process.env.NODE_ENV === "production") {
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Middleware de gestion d'erreurs Multer
app.use(multerErrorHandler);

// Middleware pour les routes non trouvées
app.use(notFoundHandler);

// Middleware global de gestion d'erreurs (doit être en dernier)
app.use(globalErrorHandler);

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Test de la connexion à la base de données
    await db.sequelize.authenticate();
    console.log("✅ Connexion à la base de données établie avec succès.");

    // Synchronisation des modèles
    if (process.env.NODE_ENV === "development") {
      await db.sequelize.sync({ alter: true });
      console.log("✅ Synchronisation des modèles terminée.");
    } else {
      // En production, vérifier que les tables existent
      await db.sequelize.sync({ force: false });
      console.log("✅ Vérification des modèles terminée.");
    }

    // Test de la connexion Redis
    try {
      // if (redisClient) {
      //   await redisClient.ping()
      //   console.log('✅ Connexion Redis établie avec succès.')
      // }
    } catch (error) {
      console.warn("⚠️  Redis non disponible, cache désactivé.");
      console.warn("   Détails:", error.message);
    }

    // Validation des variables d'environnement critiques
    const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      console.error(
        "❌ Variables d'environnement manquantes:",
        missingVars.join(", "),
      );
      process.exit(1);
    }

    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 Environnement: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🛡️  Rate limiting activé`);

      if (process.env.NODE_ENV === "development") {
        console.log(`🔧 API disponible à: http://localhost:${PORT}/api`);
        console.log(`💊 Health check: http://localhost:${PORT}/health`);
        console.log(`📊 Métriques: http://localhost:${PORT}/metrics`);
        console.log(
          `🔍 Rate limit info: http://localhost:${PORT}/api/rate-limit-info`,
        );
      }
    });

    // Configuration des timeouts
    server.timeout = 30000; // 30 secondes
    server.keepAliveTimeout = 5000; // 5 secondes
    server.headersTimeout = 6000; // 6 secondes (supérieur à keepAliveTimeout)

    // Gestion des connexions pour arrêt propre
    const connections = new Set();

    server.on("connection", (connection) => {
      connections.add(connection);
      connection.on("close", () => {
        connections.delete(connection);
      });
    });

    // Stocker les connexions pour l'arrêt propre
    server.connections = connections;

    return server;
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// Gestion des signaux pour arrêt propre
process.on("SIGTERM", async () => {
  console.log("🛑 Signal SIGTERM reçu, arrêt du serveur...");
  await gracefulShutdown();
});

process.on("SIGINT", async () => {
  console.log("🛑 Signal SIGINT reçu, arrêt du serveur...");
  await gracefulShutdown();
});

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesse rejetée non gérée:", reason);
  logger.error("Unhandled Promise Rejection:", reason);
  // Ne pas arrêter le serveur en développement
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("❌ Exception non capturée:", error);
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Fonction d'arrêt propre
async function gracefulShutdown() {
  try {
    console.log("🔄 Fermeture des connexions...");

    // Fermer le serveur HTTP
    if (global.server) {
      await new Promise((resolve) => {
        global.server.close(resolve);
      });
      console.log("✅ Serveur HTTP fermé.");

      // Fermer toutes les connexions actives
      if (global.server.connections) {
        global.server.connections.forEach((connection) => {
          connection.destroy();
        });
        console.log("✅ Connexions HTTP fermées.");
      }
    }

    // Fermer les connexions à la base de données
    if (db && db.sequelize) {
      await db.sequelize.close();
      console.log("✅ Connexion base de données fermée.");
    }

    // Fermer la connexion Redis
    // if (redisClient) {
    //   await redisClient.quit()
    //   console.log('✅ Connexion Redis fermée.')
    // }

    console.log("✅ Arrêt propre terminé.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt:", error);
    process.exit(1);
  }
}

// Démarrage du serveur seulement si ce fichier est exécuté directement
if (require.main === module) {
  startServer().then((server) => {
    global.server = server;
  });
}

module.exports = app;
