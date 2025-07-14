import React from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { motion } from 'framer-motion'

// Thème personnalisé
const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#fff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333' : '#fff',
        secondary: mode === 'light' ? '#666' : '#aaa',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h2: { fontSize: '2.5rem', fontWeight: 700 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      body1: { fontSize: '1rem' },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          },
        },
      },
    },
  })

const projects = [
  {
    title: 'Rénovation de la voirie municipale',
    excerpt: 'Réfection complète de la chaussée et aménagement durable',
    date: 'Janvier 2024',
    client: 'Ville de Lyon',
    image: 'https://source.unsplash.com/600x400/?road,asphalt',
  },
  {
    title: 'Réfection de parking commercial',
    excerpt: 'Nouveau revêtement et signalisation adaptée',
    date: 'Février 2024',
    client: 'Centre commercial Rivière',
    image: 'https://source.unsplash.com/600x400/?parking,asphalt',
  },
  {
    title: 'Travaux autoroutiers',
    excerpt: 'Modernisation et élargissement de la voie rapide',
    date: 'Mars 2024',
    client: 'Autoroutes du Sud',
    image: 'https://source.unsplash.com/600x400/?highway,construction',
  },
]

const Blog = () => {
  const theme = createAppTheme('light')

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h2" gutterBottom align="center">
          Nos Projets de Travaux d’Asphalte
        </Typography>

        <Grid container spacing={4}>
          {projects.map((project, index) => (
            <Grid
              item
              key={index}
              xs={12}
              sm={6}
              md={4}
              component={motion.div}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={project.image}
                  alt={project.title}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {project.excerpt}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption">
                      {project.client} • {project.date}
                    </Typography>
                    <Button variant="contained" size="small">
                      Voir plus
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  )
}

export default Blog
