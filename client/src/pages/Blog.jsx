import React from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
} from '@mui/material'

const Blog = () => {
  const posts = [
    {
      title: 'Les tendances du développement web en 2024',
      excerpt: "Découvrez les technologies qui façonnent l'avenir du web",
      date: '15 Mars 2024',
      author: 'Jean Dupont',
      image: '📝',
    },
    {
      title: 'Comment optimiser les performances de votre app mobile',
      excerpt:
        "Conseils pratiques pour améliorer la vitesse et l'expérience utilisateur",
      date: '10 Mars 2024',
      author: 'Marie Martin',
      image: '⚡',
    },
    {
      title: "L'importance de l'UX dans le développement",
      excerpt:
        "Pourquoi l'expérience utilisateur doit être au cœur de vos projets",
      date: '5 Mars 2024',
      author: 'Sophie Moreau',
      image: '🎨',
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Notre Blog
      </Typography>

      <Grid container spacing={4}>
        {posts.map((post, index) => (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h1">{post.image}</Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {post.excerpt}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption">
                    Par {post.author} • {post.date}
                  </Typography>
                  <Button variant="outlined" size="small">
                    Lire plus
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Blog
