// pages/ServiceDetail.jsx - Page de détail d'un service par slug
import { useLoaderData } from 'react-router-dom'
import { useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Link,
  Alert,
  Stack,
  Divider,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Fade,
  Zoom,
} from '@mui/material'

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

const ServiceDetail = () => {
  const { service, error } = useLoaderData()
  const [darkMode, setDarkMode] = useState(false)
  const theme = createAppTheme(darkMode ? 'dark' : 'light')

  // Gestion du cas service introuvable ou erreur API
  if (error || !service) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ mb: 4 }}>
              <Button
                component={Link}
                to="/services"
                size="small"
                variant="outlined"
              >
                Retour aux services
              </Button>
            </Box>
            <Alert severity="error">
              {error || 'Ce service est introuvable.'}
            </Alert>
            <Button component={Link} to="/" variant="contained">
              Retour à l'accueil
            </Button>
          </Fade>
        </Container>
      </ThemeProvider>
    )
  }

  const formatPrice = (s) => {
    if (!s.price) return 'Sur devis'
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
    switch (s.priceType) {
      case 'hourly':
        return `${formatter.format(s.price)}/h`
      case 'fixed':
        return formatter.format(s.price)
      case 'project':
        return `À partir de ${formatter.format(s.price)}`
      default:
        return 'Sur devis'
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Fade in={true} timeout={800}>
            <Button
              component={Link}
              to="/services"
              size="small"
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Retour aux services
            </Button>
          </Fade>
          <Fade in={true} timeout={1000}>
            <Typography variant="h2" gutterBottom sx={{ mt: 1 }}>
              {service.title}
            </Typography>
            <Chip
              label={service.category}
              variant="outlined"
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
            {service.isFeatured && (
              <Chip label="Mis en avant" color="primary" size="small" />
            )}
          </Fade>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <Fade in={true} timeout={1200}>
                <CardMedia
                  component="img"
                  image={service.image}
                  alt={service.title}
                  sx={{
                    height: 300,
                    objectFit: 'cover',
                    bgcolor: 'grey.200',
                  }}
                />
              </Fade>
              <CardContent>
                <Fade in={true} timeout={1400}>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {service.description}
                  </Typography>
                </Fade>

                <Fade in={true} timeout={1600}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Détails
                  </Typography>
                  <Stack spacing={1}>
                    {service.shortDescription && (
                      <Typography variant="body2" color="text.secondary">
                        {service.shortDescription}
                      </Typography>
                    )}
                    {service.duration && (
                      <Typography variant="body2" color="text.secondary">
                        Durée estimée : {service.duration}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Prix : {formatPrice(service)}
                    </Typography>
                    {service.viewCount && (
                      <Typography variant="caption" color="text.disabled">
                        {service.viewCount} vues
                      </Typography>
                    )}
                  </Stack>
                </Fade>

                {service.tags && service.tags.length > 0 && (
                  <Fade in={true} timeout={1800}>
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, fontWeight: 'bold' }}
                      >
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {service.tags.slice(0, 5).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Fade in={true} timeout={1200}>
                  <Typography variant="h6" gutterBottom>
                    Prix
                  </Typography>
                  <Typography variant="h4" color="primary.main" sx={{ mb: 2 }}>
                    {formatPrice(service)}
                  </Typography>
                  <Divider />
                </Fade>
                <Fade in={true} timeout={1400}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {service.shortDescription || service.description.slice(0, 150)}...
                  </Typography>
                </Fade>
                <Fade in={true} timeout={1600}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/quote"
                  >
                    Demander un devis
                  </Button>
                </Fade>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  )
}

export default ServiceDetail
