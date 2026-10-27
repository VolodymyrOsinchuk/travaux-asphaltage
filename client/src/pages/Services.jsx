// services/Services.jsx - Page principale des services
// Style cohérent avec les pages About et Projects du projet
import {
  useLoaderData,
  useSearchParams,
  useNavigation,
  Link,
} from 'react-router-dom'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  Skeleton,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Fade,
  Zoom,
} from '@mui/material'
import {
  Search,
  FilterList,
  ViewModule,
  ViewList,
  Star,
  Visibility,
} from '@mui/icons-material'
import { ServicesAPI } from '../services/serviceService'
import { useState } from 'react'

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

// Loader pour la page des services (utilisé par App.jsx)
export const loader = async ({ request }) => {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams)

  try {
    const [servicesResponse, categoriesResponse] = await Promise.all([
      ServicesAPI.getAllServices({
        page: searchParams.page || 1,
        limit: searchParams.limit || 9,
        category: searchParams.category,
        featured: searchParams.featured,
        search: searchParams.search,
        sortBy: searchParams.sortBy || 'order',
        sortOrder: searchParams.sortOrder || 'ASC',
      }),
      ServicesAPI.getServiceCategories(),
    ])

    return {
      services: servicesResponse.data.services,
      pagination: servicesResponse.data.pagination,
      categories: categoriesResponse.data.categories,
      filters: searchParams,
    }
  } catch (error) {
    throw new Response('Erreur lors du chargement des services', {
      status: 500,
    })
  }
}

// Composant de skeleton pour le loading
const ServiceCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Skeleton
          variant="rectangular"
          width={80}
          height={80}
          sx={{ mx: 'auto' }}
        />
      </Box>
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Skeleton variant="rectangular" width={60} height={24} />
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={70} height={24} />
      </Stack>
    </CardContent>
    <CardActions>
      <Skeleton variant="rectangular" width="100%" height={36} />
    </CardActions>
  </Card>
)

// Composant ServiceCard
const ServiceCard = ({ service }) => {
  const handleViewIncrement = async () => {
    try {
      await ServicesAPI.incrementViewCount(service.id)
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues:", error)
    }
  }

  const formatPrice = (service) => {
    if (!service.price) return 'Sur devis'

    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })

    switch (service.priceType) {
      case 'hourly':
        return `${formatter.format(service.price)}/h`
      case 'fixed':
        return formatter.format(service.price)
      case 'project':
        return `À partir de ${formatter.format(service.price)}`
      default:
        return 'Sur devis'
    }
  }

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      {service.isFeatured && (
        <Chip
          icon={<Star />}
          label="Mis en avant"
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
      )}

      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              style={{ width: 80, height: 80, objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                fontSize: '2rem',
                mx: 'auto',
              }}
            >
              {service.icon || service.title.charAt(0)}
            </Box>
          )}
        </Box>

        <Typography variant="h5" gutterBottom>
          {service.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, height: '3em', overflow: 'hidden' }}
        >
          {service.shortDescription}
        </Typography>

        <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
          {formatPrice(service)}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={service.category}
            variant="outlined"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          {service.tags?.slice(0, 2).map((tag, idx) => (
            <Chip key={idx} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
          ))}
          {service.tags?.length > 2 && (
            <Chip
              label={`+${service.tags.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Visibility fontSize="small" color="disabled" />
          <Typography variant="caption" color="text.secondary">
            {service.viewCount || 0} vues
          </Typography>
        </Box>

        {service.duration && (
          <Typography variant="caption" color="text.secondary">
            Durée: {service.duration}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          component={Link}
          to={`/services/${service.slug}`}
          variant="contained"
          fullWidth
          onClick={handleViewIncrement}
        >
          En savoir plus
        </Button>
      </CardActions>
    </Card>
  )
}

// Composant principal Services
const Services = () => {
  const { services, pagination, categories, filters } = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const [darkMode, setDarkMode] = useState(false)
  const theme = createAppTheme(darkMode ? 'dark' : 'light')

  const isLoading = navigation.state === 'loading'

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value && value !== '') {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.delete('page') // Reset page when filtering
    setSearchParams(newParams)
  }

  const handlePageChange = (event, value) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', value.toString())
    setSearchParams(newParams)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const searchTerm = formData.get('search')
    handleFilterChange('search', searchTerm)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h2"
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
                Nos Services
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
              >
                Découvrez notre gamme complète de prestations en travaux
                d'asphalte et de revêtement routier.
              </Typography>

              <Button
                variant="outlined"
                onClick={() => setDarkMode(!darkMode)}
                sx={{ mb: 4 }}
              >
                {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
              </Button>
            </Box>
          </Fade>

          {/* Filtres et recherche */}
          <Fade in={true} timeout={1200}>
            <Card sx={{ mb: 4, p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <form onSubmit={handleSearchSubmit}>
                    <TextField
                      name="search"
                      placeholder="Rechercher un service..."
                      defaultValue={filters.search || ''}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </form>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      value={filters.category || ''}
                      onChange={(e) =>
                        handleFilterChange('category', e.target.value)
                      }
                      label="Catégorie"
                    >
                      <MenuItem value="">Toutes</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tri</InputLabel>
                    <Select
                      value={filters.sortBy || 'order'}
                      onChange={(e) =>
                        handleFilterChange('sortBy', e.target.value)
                      }
                      label="Tri"
                    >
                      <MenuItem value="order">Ordre</MenuItem>
                      <MenuItem value="title">Titre</MenuItem>
                      <MenuItem value="createdAt">Date</MenuItem>
                      <MenuItem value="viewCount">Popularité</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ordre</InputLabel>
                    <Select
                      value={filters.sortOrder || 'ASC'}
                      onChange={(e) =>
                        handleFilterChange('sortOrder', e.target.value)
                      }
                      label="Ordre"
                    >
                      <MenuItem value="ASC">Croissant</MenuItem>
                      <MenuItem value="DESC">Décroissant</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSearchParams({})}
                    disabled={Object.keys(filters).length === 0}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Fade>

          {/* Résultats */}
          {isLoading ? (
            <Zoom in={true} timeout={1400}>
              <Grid container spacing={3}>
                {[...Array(6)].map((_, index) => (
                  <Grid key={index} size={{ xs: 12, md: 4 }}>
                    <ServiceCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            </Zoom>
          ) : (
            <>
              {services.length === 0 ? (
                <Zoom in={true} timeout={1400}>
                  <Alert severity="info">
                    Aucun service trouvé avec les critères sélectionnés.
                  </Alert>
                </Zoom>
              ) : (
                <>
                  <Fade in={true} timeout={1400}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pagination.totalItems} service(s) trouvé(s)
                    </Typography>
                  </Fade>

                  <Zoom in={true} timeout={1600}>
                    <Grid container spacing={3}>
                      {services.map((service) => (
                        <Grid key={service.id} size={{ xs: 12, md: 4 }}>
                          <ServiceCard service={service} />
                        </Grid>
                      ))}
                    </Grid>
                  </Zoom>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Fade in={true} timeout={1800}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                          count={pagination.totalPages}
                          page={pagination.currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                        />
                      </Box>
                    </Fade>
                  )}
                </>
              )}
            </>
          )}
        </Box>

        {/* Section d'appel à l'action */}
        <Zoom in={true} timeout={2000} style={{ transitionDelay: '1000ms' }}>
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
              Prêt à démarrer votre projet ?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Contactez-nous pour un devis gratuit et personnalisé
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
                to="/quote"
              >
                Demander un Devis
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
                to="/contact"
              >
                Nous Contacter
              </Button>
            </Box>
          </Card>
        </Zoom>
      </Container>
    </ThemeProvider>
  )
}

export default Services
