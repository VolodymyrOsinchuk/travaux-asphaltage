import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Fade,
  Zoom,
  Link,
} from '@mui/material'
import { Construction, Home, Business } from '@mui/icons-material'

// Thème personnalisé (identique aux pages About et Projects)
const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
        light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
        dark: mode === 'light' ? '#1565c0' : '#42a5f5',
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#b0b0b0',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '3rem', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.3 },
      h3: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.4 },
      h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  })

const NotFound = () => {
  const [darkMode, setDarkMode] = useState(false)
  const theme = createAppTheme(darkMode ? 'dark' : 'light')

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<Construction />}
                label="Page introuvable"
                color="secondary"
                size="medium"
                sx={{ mb: 3 }}
              />
              <Typography
                variant="h1"
                sx={{
                  mb: 2,
                  background:
                    'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                }}
              >
                404
              </Typography>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                Cette page n'existe pas
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}
              >
                La page que vous recherchez est introuvable ou n'est plus
                disponible. L'URL peut être erronée ou la page a été déplacée.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Home />}
                  component={Link}
                  to="/"
                >
                  Retour à l'accueil
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Business />}
                  component={Link}
                  to="/services"
                >
                  Voir nos services
                </Button>
              </Box>
            </Box>
          </Fade>

          <Zoom in={true} timeout={1200} style={{ transitionDelay: '300ms' }}>
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                background:
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Besoin d'aide ?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                Contactez-nous pour obtenir de l'assistance ou demandez un
                devis personnalisé.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                  component={Link}
                  to="/contact"
                >
                  Nous contacter
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  component={Link}
                  to="/quote"
                >
                  Demander un devis
                </Button>
              </Box>
            </Card>
          </Zoom>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default NotFound
