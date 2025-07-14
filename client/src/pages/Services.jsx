// services/Services.jsx - Page principale des services
import {
  useLoaderData,
  useSearchParams,
  useNavigation,
  Link,
  Form,
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
  IconButton,
  InputAdornment,
  Skeleton,
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

// Loader pour la page des services
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Nos Services
      </Typography>

      {/* Filtres et recherche */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Form onSubmit={handleSearchSubmit}>
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
            </Form>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
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

      {/* Résultats */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <ServiceCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {services.length === 0 ? (
            <Alert severity="info">
              Aucun service trouvé avec les critères sélectionnés.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {pagination.totalItems} service(s) trouvé(s)
              </Typography>

              <Grid container spacing={3}>
                {services.map((service) => (
                  <Grid key={service.id} size={{ xs: 12, md: 4 }}>
                    <ServiceCard service={service} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  )
}

export default Services
