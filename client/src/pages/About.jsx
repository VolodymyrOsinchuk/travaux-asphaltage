import React, { useState, useEffect } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  createTheme,
  CssBaseline,
  Divider,
  Fade,
  Grid,
  IconButton,
  Paper,
  Slide,
  ThemeProvider,
  Tooltip,
  Typography,
  useMediaQuery,
  Zoom,
} from '@mui/material'
import {
  CheckCircle,
  Construction,
  Email,
  EnergySavingsLeaf,
  Engineering,
  ExpandLess,
  ExpandMore,
  History,
  NoiseAware,
  Phone,
  Speed,
  Star,
  Timeline,
  LinkedIn,
} from '@mui/icons-material'

// Thème personnalisé
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

// Composant pour les statistiques animées
const AnimatedCounter = ({ value, label, icon, duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const increment = value / (duration / 50)
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= value) {
          clearInterval(timer)
          return value
        }
        return Math.min(prev + increment, value)
      })
    }, 50)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <Zoom in={isVisible} timeout={1000}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            transition: 'transform 0.3s ease-in-out',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ mb: 2 }}>{icon}</Box>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            {Math.round(count)}
          </Typography>
          <Typography variant="body1">{label}</Typography>
        </Box>
      </Paper>
    </Zoom>
  )
}

// Composant pour les valeurs de l'entreprise
const ValueCard = ({ value, index }) => {
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
          transition: 'all 0.3s ease-in-out',
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
          <Box
            sx={{
              mb: 2,
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {value.icon}
          </Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            {value.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {value.description}
          </Typography>
        </CardContent>
      </Card>
    </Slide>
  )
}

// Composant pour les membres d'équipe
const TeamMemberCard = ({ member, index }) => {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <Slide
      direction="up"
      in={true}
      timeout={500 + index * 150}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              fontSize: '2rem',
              background: `linear-gradient(135deg, ${member.gradient})`,
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {member.avatar}
          </Avatar>

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            {member.name}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {member.role}
          </Typography>

          <Box
            sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}
          >
            {member.skills.map((skill, idx) => (
              <Chip
                key={idx}
                label={skill}
                size="small"
                variant="outlined"
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

          <Button
            variant="text"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ mb: 2 }}
          >
            {expanded ? 'Moins' : "Plus d'infos"}
          </Button>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {member.bio}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Tooltip title="LinkedIn">
                <IconButton size="small" color="primary">
                  <LinkedIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Email">
                <IconButton size="small" color="primary">
                  <Email />
                </IconButton>
              </Tooltip>
              <Tooltip title="Téléphone">
                <IconButton size="small" color="primary">
                  <Phone />
                </IconButton>
              </Tooltip>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Slide>
  )
}

const About = () => {
  const [darkMode, setDarkMode] = useState(false)
  const theme = createAppTheme(darkMode ? 'dark' : 'light')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  useEffect(() => {
    setDarkMode(prefersDarkMode)
  }, [prefersDarkMode])

  const stats = [
    {
      value: 25,
      label: "Années d'expérience",
      icon: <History sx={{ fontSize: 40 }} />,
    },
    {
      value: 500,
      label: 'Projets réalisés',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
    },
    {
      value: 1500,
      label: "Km d'asphalte posé",
      icon: <Timeline sx={{ fontSize: 40 }} />,
    },
    {
      value: 98,
      label: 'Satisfaction client (%)',
      icon: <Star sx={{ fontSize: 40 }} />,
    },
  ]

  const values = [
    {
      title: 'Qualité Premium',
      description:
        'Nous utilisons uniquement des matériaux de première qualité et des équipements de pointe pour garantir la durabilité de nos réalisations.',
      icon: <NoiseAware sx={{ fontSize: 60, color: 'primary.main' }} />,
    },
    {
      title: 'Expertise Technique',
      description:
        "Notre équipe maîtrise toutes les techniques modernes d'asphalte et de revêtement routier, avec une formation continue.",
      icon: <Engineering sx={{ fontSize: 60, color: 'success.main' }} />,
    },
    {
      title: 'Respect des Délais',
      description:
        'Nous nous engageons à respecter les calendriers convenus, avec une planification rigoureuse et des équipes dédiées.',
      icon: <Speed sx={{ fontSize: 60, color: 'warning.main' }} />,
    },
    {
      title: 'Développement Durable',
      description:
        "Nous intégrons des pratiques éco-responsables dans tous nos projets, avec des matériaux recyclés et des procédés respectueux de l'environnement.",
      icon: <EnergySavingsLeaf sx={{ fontSize: 60, color: 'success.main' }} />,
    },
  ]

  const team = [
    {
      name: 'Michel Dubois',
      role: 'Directeur Général',
      avatar: '👨‍💼',
      skills: ['Leadership', 'Stratégie', 'Business'],
      bio: "Expert en travaux routiers avec 20 ans d'expérience. Diplômé en génie civil et passionné par l'innovation dans le secteur de l'asphalte.",
      gradient: '#667eea, #764ba2',
    },
    {
      name: 'Sophie Moreau',
      role: 'Directrice Technique',
      avatar: '👩‍🔬',
      skills: ['Asphalte', 'Qualité', 'Innovation'],
      bio: "Ingénieure spécialisée en matériaux routiers. Responsable de la qualité et de l'innovation technique dans tous nos projets.",
      gradient: '#f093fb, #f5576c',
    },
    {
      name: 'Jean-Pierre Martin',
      role: 'Chef de Chantier Senior',
      avatar: '👨‍🏭',
      skills: ['Chantier', 'Équipe', 'Sécurité'],
      bio: "Superviseur expérimenté avec 15 ans sur le terrain. Expert en gestion d'équipe et en sécurité sur chantier.",
      gradient: '#4facfe, #00f2fe',
    },
    {
      name: 'Amélie Rousseau',
      role: 'Responsable Qualité',
      avatar: '👩‍🔬',
      skills: ['Contrôle', 'Normes', 'Audit'],
      bio: "Spécialiste en contrôle qualité et respect des normes. Garante de l'excellence dans tous nos projets d'asphalte.",
      gradient: '#a8edea, #fed6e3',
    },
    {
      name: 'Thomas Leroy',
      role: 'Ingénieur Travaux',
      avatar: '👨‍💻',
      skills: ['Planification', 'CAO', 'Études'],
      bio: 'Ingénieur en charge des études techniques et de la planification. Maîtrise parfaite des outils de conception assistée.',
      gradient: '#ffecd2, #fcb69f',
    },
    {
      name: 'Caroline Blanc',
      role: 'Responsable Environnement',
      avatar: '👩‍🌾',
      skills: ['Environnement', 'Recyclage', 'Durable'],
      bio: 'Experte en développement durable et impact environnemental. Pilote nos initiatives éco-responsables.',
      gradient: '#ff9a9e, #fecfef',
    },
  ]

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header avec animation */}
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
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
                À propos d'AsphalteExpert
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
              >
                Leaders en travaux d'asphalte et de revêtement routier depuis
                1999. Nous transformons vos projets en réalisations durables et
                de qualité.
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

          {/* Statistiques animées */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid key={index} size={{ xs: 6, md: 3 }}>
                <AnimatedCounter {...stat} />
              </Grid>
            ))}
          </Grid>

          {/* Section principale */}
          <Grid container spacing={6} sx={{ mb: 8 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Fade in={true} timeout={1500}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Notre Histoire
                  </Typography>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                  >
                    Fondée en 1999, AsphalteExpert s'est imposée comme une
                    référence incontournable dans le domaine des travaux
                    routiers et de l'asphalte. Notre entreprise familiale a
                    grandi en gardant ses valeurs d'excellence et de proximité
                    client.
                  </Typography>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                  >
                    Nous maîtrisons toutes les techniques modernes d'asphalte :
                    pose, réparation, marquage au sol, création de parkings et
                    aménagement de voiries. Notre équipe de 50 professionnels
                    expérimentés intervient sur tout type de chantier.
                  </Typography>
                  <Typography
                    variant="body1"
                    paragraph
                    sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                  >
                    Avec plus de 500 projets réalisés et 1500 km d'asphalte
                    posé, nous continuons d'innover pour offrir des solutions
                    toujours plus performantes et durables.
                  </Typography>
                </Box>
              </Fade>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Zoom
                in={true}
                timeout={1500}
                style={{ transitionDelay: '500ms' }}
              >
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Construction sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Notre Mission
                  </Typography>
                  <Typography variant="body1">
                    Créer des infrastructures routières durables qui améliorent
                    la mobilité et la qualité de vie des communautés.
                  </Typography>
                </Paper>
              </Zoom>
            </Grid>
          </Grid>

          {/* Nos Valeurs */}
          <Box sx={{ mb: 8 }}>
            <Fade in={true} timeout={1000}>
              <Typography
                variant="h4"
                sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}
              >
                Nos Valeurs
              </Typography>
            </Fade>

            <Grid container spacing={4}>
              {values.map((value, index) => (
                <Grid key={index} size={{ xs: 12, md: 6 }}>
                  <ValueCard value={value} index={index} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Notre Équipe */}
          <Box sx={{ mb: 8 }}>
            <Fade in={true} timeout={1000}>
              <Typography
                variant="h4"
                sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}
              >
                Notre Équipe d'Experts
              </Typography>
            </Fade>

            <Grid container spacing={3}>
              {team.map((member, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                  <TeamMemberCard member={member} index={index} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Section d'appel à l'action */}
          <Zoom in={true} timeout={1000} style={{ transitionDelay: '1000ms' }}>
            <Paper
              elevation={8}
              sx={{
                p: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
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
                  startIcon={<Phone />}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Nous Appeler
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Email />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Demander un Devis
                </Button>
              </Box>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default About
