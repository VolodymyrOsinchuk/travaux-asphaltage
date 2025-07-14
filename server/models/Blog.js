// models/Blog.js
const BlogModel = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    'Blog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          len: [5, 200],
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING(250),
        allowNull: false,
        unique: true,
        validate: {
          len: [5, 250],
          notEmpty: true,
        },
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [20, 500],
          notEmpty: true,
        },
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        validate: {
          len: [100, 50000],
          notEmpty: true,
        },
      },
      featuredImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [2, 50],
          notEmpty: true,
        },
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'scheduled', 'archived'),
        defaultValue: 'draft',
        allowNull: false,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      readTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Temps de lecture en minutes',
      },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      seoTitle: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      seoDescription: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
      seoKeywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      tableName: 'blogs',
      timestamps: true,
      paranoid: true, // Soft deletes
      hooks: {
        beforeCreate: (blog) => {
          if (!blog.slug) {
            blog.slug = blog.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .replace(/^-|-$/g, '')
          }

          if (!blog.readTime && blog.content) {
            const wordsPerMinute = 200
            const wordCount = blog.content
              .split(/\s+/)
              .filter((word) => word.length > 0).length
            blog.readTime = Math.ceil(wordCount / wordsPerMinute)
          }

          // Auto-set publishedAt if status is published
          if (blog.status === 'published' && !blog.publishedAt) {
            blog.publishedAt = new Date()
          }
        },
        beforeUpdate: (blog) => {
          if (blog.changed('title') && !blog.changed('slug')) {
            blog.slug = blog.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .replace(/^-|-$/g, '')
          }

          if (blog.changed('content') && blog.content) {
            const wordsPerMinute = 200
            const wordCount = blog.content
              .split(/\s+/)
              .filter((word) => word.length > 0).length
            blog.readTime = Math.ceil(wordCount / wordsPerMinute)
          }

          // Handle status changes
          if (blog.changed('status')) {
            if (blog.status === 'published' && !blog.publishedAt) {
              blog.publishedAt = new Date()
            } else if (blog.status !== 'published' && blog.publishedAt) {
              blog.publishedAt = null
            }
          }
        },
      },
      scopes: {
        published: {
          where: { status: 'published' },
          order: [['publishedAt', 'DESC']],
        },
        featured: {
          where: { status: 'published', isFeatured: true },
          order: [['publishedAt', 'DESC']],
        },
        draft: {
          where: { status: 'draft' },
          order: [['updatedAt', 'DESC']],
        },
        withAuthor: {
          include: [
            {
              model: sequelize.models.User,
              as: 'author',
              attributes: ['id', 'name', 'email', 'avatar'],
            },
          ],
        },
      },
      indexes: [
        { fields: ['status'] },
        { fields: ['category'] },
        { fields: ['slug'] },
        { fields: ['publishedAt'] },
        { fields: ['isFeatured'] },
        { fields: ['authorId'] },
        { fields: ['createdAt'] },
        { fields: ['viewCount'] },
      ],
    }
  )

  // Static methods
  Blog.findPublished = function (options = {}) {
    return this.scope('published').findAll({
      ...options,
      where: {
        status: 'published',
        ...options.where,
      },
    })
  }

  Blog.findFeatured = function (options = {}) {
    return this.scope('featured').findAll({
      ...options,
      where: {
        status: 'published',
        isFeatured: true,
        ...options.where,
      },
    })
  }

  Blog.findByCategory = function (category, options = {}) {
    return this.findAll({
      ...options,
      where: {
        category,
        status: 'published',
        ...options.where,
      },
      order: [['publishedAt', 'DESC']],
    })
  }

  Blog.findBySlug = function (slug, includeUnpublished = false) {
    const whereClause = { slug }
    if (!includeUnpublished) {
      whereClause.status = 'published'
    }
    return this.findOne({ where: whereClause })
  }

  Blog.findByTags = function (tags, options = {}) {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    return this.findAll({
      ...options,
      where: {
        status: 'published',
        [sequelize.Op.or]: tagArray.map((tag) => ({
          tags: {
            [sequelize.Op.like]: `%${tag}%`,
          },
        })),
        ...options.where,
      },
      order: [['publishedAt', 'DESC']],
    })
  }

  Blog.getStats = async function () {
    const [totalPosts, publishedPosts, draftPosts, totalViews] =
      await Promise.all([
        this.count(),
        this.count({ where: { status: 'published' } }),
        this.count({ where: { status: 'draft' } }),
        this.sum('viewCount') || 0,
      ])

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
    }
  }

  // Instance methods
  Blog.prototype.incrementViewCount = function () {
    return this.increment('viewCount')
  }

  Blog.prototype.publish = function () {
    return this.update({
      status: 'published',
      publishedAt: new Date(),
    })
  }

  Blog.prototype.unpublish = function () {
    return this.update({
      status: 'draft',
      publishedAt: null,
    })
  }

  Blog.prototype.toggleFeatured = function () {
    return this.update({
      isFeatured: !this.isFeatured,
    })
  }

  Blog.prototype.getRelatedPosts = function (limit = 3) {
    return Blog.findAll({
      where: {
        id: { [sequelize.Op.ne]: this.id },
        category: this.category,
        status: 'published',
      },
      limit,
      order: [['publishedAt', 'DESC']],
      attributes: [
        'id',
        'title',
        'slug',
        'excerpt',
        'featuredImage',
        'category',
        'readTime',
        'viewCount',
        'publishedAt',
      ],
    })
  }

  // Associations
  Blog.associate = function (models) {
    Blog.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author',
    })

    // Si vous avez d'autres modèles liés (commentaires, likes, etc.)
    // Blog.hasMany(models.Comment, {
    //   foreignKey: 'blogId',
    //   as: 'comments',
    // })
  }

  return Blog
}

module.exports = BlogModel
