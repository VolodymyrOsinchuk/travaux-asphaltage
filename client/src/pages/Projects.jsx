import React, { useState, useEffect } from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Collapse,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  Tooltip,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from '@mui/material'
import {
  Construction,
  LocationOn,
  CalendarToday,
  Groups,
  Speed,
  Engineering,
  Visibility,
  ExpandMore,
  ExpandLess,
  Star,
  Timeline,
  TrendingUp,
  CheckCircle,
  Schedule,
  LocalShipping,
} from '@mui/icons-material'

// Thème personnalisé avec mode sombre
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
      h1: {
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
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
            boxShadow:
              mode === 'light'
                ? '0 4px 20px rgba(0,0,0,0.08)'
                : '0 4px 20px rgba(0,0,0,0.3)',
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

// Composant pour les statistiques animées
const AnimatedStat = ({ value, label, icon, delay = 0 }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      const increment = value / 50
      const timer = setInterval(() => {
        setCount((prev) => {
          if (prev >= value) {
            clearInterval(timer)
            return value
          }
          return Math.min(prev + increment, value)
        })
      }, 30)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <Fade in={isVisible} timeout={1000}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Box sx={{ mb: 2 }}>{icon}</Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          {Math.round(count)}
        </Typography>
        <Typography variant="body2">{label}</Typography>
      </Paper>
    </Fade>
  )
}

// Composant pour les projets avec animations
const ProjectCard = ({ project, index }) => {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <Slide
      direction="up"
      in={true}
      timeout={500 + index * 200}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Barre de progression animée */}
        <LinearProgress
          variant="determinate"
          value={project.progress}
          sx={{
            height: 4,
            '& .MuiLinearProgress-bar': {
              transition: 'transform 2s ease-in-out',
            },
          }}
        />

        {/* Image du projet */}
        <CardMedia
          component="div"
          sx={{
            height: 200,
            background: `linear-gradient(135deg, ${project.gradient})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              fontSize: '4rem',
              transform: hovered ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {project.icon}
          </Box>

          {/* Badge de statut */}
          <Chip
            label={project.status}
            color={
              project.status === 'Terminé'
                ? 'success'
                : project.status === 'En cours'
                ? 'warning'
                : 'info'
            }
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontWeight: 'bold',
            }}
          />
        </CardMedia>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              {project.title}
            </Typography>
            <Tooltip title="Voir détails">
              <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                <ExpandMore />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project.description}
          </Typography>

          {/* Informations rapides */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              icon={<LocationOn />}
              label={project.location}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<CalendarToday />}
              label={project.duration}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<Groups />}
              label={`${project.team} équipe`}
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Technologies/Équipements */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Équipements utilisés:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {project.equipment.map((tech, idx) => (
                <Chip
                  key={idx}
                  label={tech}
                  variant="outlined"
                  size="small"
                  sx={{
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Détails étendus */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ space: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                Détails du projet:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2">
                  Surface: {project.surface} m²
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2">
                  Avancement: {project.progress}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2">
                  Satisfaction client: {project.rating}/5
                </Typography>
              </Box>
            </Box>
          </Collapse>

          {/* Boutons d'action */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Visibility />}
              fullWidth
              sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                '&:hover': {
                  background:
                    'linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)',
                },
              }}
            >
              Voir le projet
            </Button>
            <IconButton
              color="primary"
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <Engineering />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  )
}

const Projects = () => {
  const [darkMode, setDarkMode] = useState(false)
  const theme = createAppTheme(darkMode ? 'dark' : 'light')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  useEffect(() => {
    setDarkMode(prefersDarkMode)
  }, [prefersDarkMode])

  const projects = [
    {
      title: 'Autoroute A40 - Rénovation',
      description:
        "Rénovation complète de 15km d'autoroute avec asphalte haute performance",
      equipment: [
        'Finisseur',
        'Rouleau compacteur',
        "Centrale d'enrobage",
        'Fraiseuse',
      ],
      icon: <Construction />,
      status: 'Terminé',
      location: 'Lyon',
      duration: '6 mois',
      team: '25',
      surface: '45000',
      progress: 100,
      rating: 4.8,
      gradient: '#667eea, #764ba2',
    },
    {
      title: 'Parking Centre Commercial',
      description:
        "Création d'un parking de 500 places avec revêtement drainant",
      equipment: ['Mini-finisseur', 'Rouleau tandem', 'Compacteur à pneus'],
      icon: <LocalShipping />,
      status: 'En cours',
      location: 'Marseille',
      duration: '3 mois',
      team: '15',
      surface: '12000',
      progress: 65,
      rating: 4.5,
      gradient: '#f093fb, #f5576c',
    },
    {
      title: 'Zone Industrielle Est',
      description:
        'Aménagement de voiries industrielles avec asphalte renforcé',
      equipment: ['Finisseur ABG', 'Rouleau vibrant', 'Camion malaxeur'],
      icon: <Engineering />,
      status: 'Terminé',
      location: 'Toulouse',
      duration: '4 mois',
      team: '20',
      surface: '28000',
      progress: 100,
      rating: 4.9,
      gradient: '#4facfe, #00f2fe',
    },
    {
      title: 'Pistes Cyclables Urbaines',
      description:
        'Réseau de pistes cyclables avec asphalte coloré et marquage',
      equipment: ['Mini-finisseur', 'Rouleau léger', 'Pulvérisateur'],
      icon: <Speed />,
      status: 'En planification',
      location: 'Nice',
      duration: '2 mois',
      team: '10',
      surface: '8500',
      progress: 15,
      rating: 4.7,
      gradient: '#a8edea, #fed6e3',
    },
    {
      title: 'Rond-Point Majeur',
      description: "Construction d'un rond-point avec îlot central paysager",
      equipment: ['Finisseur compact', 'Rouleau articulé', 'Niveleuse'],
      icon: <Timeline />,
      status: 'En cours',
      location: 'Bordeaux',
      duration: '1 mois',
      team: '8',
      surface: '3200',
      progress: 40,
      rating: 4.6,
      gradient: '#ffecd2, #fcb69f',
    },
    {
      title: 'Réparation Route Départementale',
      description: "Réparation d'urgence avec asphalte à prise rapide",
      equipment: ['Finisseur mobile', 'Rouleau compact', 'Chaudière'],
      icon: <CheckCircle />,
      status: 'Terminé',
      location: 'Strasbourg',
      duration: '2 semaines',
      team: '12',
      surface: '5600',
      progress: 100,
      rating: 4.4,
      gradient: '#ff9a9e, #fecfef',
    },
  ]

  const stats = [
    {
      value: 150,
      label: 'Projets Terminés',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      delay: 0,
    },
    {
      value: 25,
      label: 'Projets En Cours',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      delay: 200,
    },
    {
      value: 98,
      label: 'Satisfaction Client (%)',
      icon: <Star sx={{ fontSize: 40 }} />,
      delay: 400,
    },
    {
      value: 500000,
      label: "M² d'Asphalte Posé",
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      delay: 600,
    },
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header avec animation */}
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
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
                Nos Projets d'Asphalte
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Découvrez nos réalisations en travaux routiers et d'asphalte
              </Typography>

              {/* Bouton pour changer de thème */}
              <Button
                variant="outlined"
                onClick={() => setDarkMode(!darkMode)}
                sx={{ mb: 4 }}
              >
                {darkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
              </Button>
            </Box>
          </Fade>

          {/* Statistiques animées */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {stats.map((stat, index) => (
              <Grid key={index} size={{ xs: 6, md: 3 }}>
                <AnimatedStat {...stat} />
              </Grid>
            ))}
          </Grid>

          {/* Grille des projets */}
          <Grid container spacing={3}>
            {projects.map((project, index) => (
              <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
                <ProjectCard project={project} index={index} />
              </Grid>
            ))}
          </Grid>

          {/* Section d'appel à l'action */}
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '1000ms' }}>
            <Paper
              elevation={8}
              sx={{
                mt: 6,
                p: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                Prêt pour votre prochain projet ?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Contactez-nous pour un devis personnalisé et découvrez comment
                nous pouvons transformer vos idées en réalité.
              </Typography>
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
              >
                Demander un Devis
              </Button>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default Projects
