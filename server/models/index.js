const { Sequelize } = require('sequelize')
const path = require('path')
const pg = require('pg')
const fs = require('fs')

// Configuration de la base de données
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: process.env.DB_DIALECT || 'postgress',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
  ssl: true,
  dialectModule: pg,
  //   logging: process.env.NODE_ENV === 'development' ? console.log : false,
  //   pool: {
  //     max: 5,
  //     min: 0,
  //     acquire: 30000,
  //     idle: 10000,
  //   },
  //   define: {
  //     timestamps: true,
  //     underscored: true,
  //     freezeTableName: true,
  //   },
})

const db = {}

// Import automatique des modèles
const modelsPath = __dirname
const modelFiles = fs
  .readdirSync(modelsPath)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js'
  )

// Initialisation des modèles
modelFiles.forEach((file) => {
  const model = require(path.join(modelsPath, file))(
    sequelize,
    Sequelize.DataTypes
  )
  db[model.name] = model
})

// Configuration des associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
