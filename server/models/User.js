// models/User.js
const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 30],
          is: /^[a-zA-Z0-9_]+$/,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100],
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [2, 50],
          is: /^[a-zA-ZÀ-ÿ\s-']+$/,
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [2, 50],
          is: /^[a-zA-ZÀ-ÿ\s-']+$/,
        },
      },
      role: {
        type: DataTypes.ENUM('admin', 'user', 'moderator'),
        allowNull: false,
        defaultValue: 'user',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lockUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      twoFactorSecret: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isTwoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^\+?[1-9]\d{1,14}$/,
        },
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      timezone: {
        type: DataTypes.STRING,
        defaultValue: 'UTC',
      },
      language: {
        type: DataTypes.STRING(5),
        defaultValue: 'fr',
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
            user.password = await bcrypt.hash(user.password, saltRounds)
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12
            user.password = await bcrypt.hash(user.password, saltRounds)
          }
        },
      },
      defaultScope: {
        attributes: {
          exclude: [
            'password',
            'refreshToken',
            'resetPasswordToken',
            'emailVerificationToken',
            'twoFactorSecret',
          ],
        },
      },
      scopes: {
        withPassword: {
          attributes: {},
        },
        withTokens: {
          attributes: {
            exclude: ['password', 'twoFactorSecret'],
          },
        },
      },
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          unique: true,
          fields: ['username'],
        },
        {
          fields: ['isActive'],
        },
        {
          fields: ['role'],
        },
        {
          fields: ['resetPasswordToken'],
        },
        {
          fields: ['emailVerificationToken'],
        },
      ],
    }
  )

  // Méthodes d'instance
  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
  }

  User.prototype.getFullName = function () {
    return `${this.firstName} ${this.lastName}`
  }

  User.prototype.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > Date.now())
  }

  User.prototype.incrementLoginAttempts = async function () {
    const maxAttempts = 5
    const lockTime = 2 * 60 * 60 * 1000 // 2 heures

    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        loginAttempts: 1,
        lockUntil: null,
      })
    }

    const updates = { loginAttempts: this.loginAttempts + 1 }

    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
      updates.lockUntil = Date.now() + lockTime
    }

    return this.update(updates)
  }

  User.prototype.resetLoginAttempts = async function () {
    return this.update({
      loginAttempts: 0,
      lockUntil: null,
    })
  }

  User.prototype.hasPermission = function (permission) {
    return this.permissions && this.permissions.includes(permission)
  }

  User.prototype.hasRole = function (role) {
    return this.role === role
  }

  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get())

    // Supprimer les champs sensibles
    delete values.password
    delete values.refreshToken
    delete values.resetPasswordToken
    delete values.emailVerificationToken
    delete values.twoFactorSecret

    return values
  }

  // Méthodes statiques
  User.findByEmailOrUsername = async function (identifier) {
    return await this.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email: identifier },
          { username: identifier },
        ],
      },
    })
  }

  User.findActiveUsers = async function () {
    return await this.findAll({
      where: { isActive: true },
    })
  }

  User.findByRole = async function (role) {
    return await this.findAll({
      where: { role },
    })
  }

  User.countByRole = async function () {
    return await this.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: 'role',
    })
  }

  return User
}
