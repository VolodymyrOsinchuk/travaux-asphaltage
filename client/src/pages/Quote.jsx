import React, { useState } from 'react'
import {
  Typography,
  Button,
  Container,
  Grid,
  TextField,
  Paper,
  Box,
  Chip,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Card,
  CardContent,
  useTheme,
  alpha,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  AddRoad,
  AttachMoney,
  Business,
  CheckCircle,
  Construction,
  DateRange,
  Description,
  Email,
  HomeRepairService,
  LocalShipping,
  LocationOn,
  Person,
  Phone,
  Send,
  Speed,
  Timeline,
} from '@mui/icons-material'

const Quote = () => {
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    projectType: '',
    surface: '',
    budget: '',
    deadline: '',
    description: '',
    urgency: 'normal',
  })

  const [hoveredCard, setHoveredCard] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const projectTypes = [
    {
      id: 'revêtement',
      label: 'Revêtement Asphalte',
      icon: <AddRoad />,
      description: 'Pose de nouveau revêtement',
      color: '#1976d2',
    },
    {
      id: 'réparation',
      label: 'Réparation',
      icon: <HomeRepairService />,
      description: 'Réparation de fissures et nids-de-poule',
      color: '#f57c00',
    },
    {
      id: 'marquage',
      label: 'Marquage Routier',
      icon: <Timeline />,
      description: 'Peinture et signalisation',
      color: '#388e3c',
    },
    {
      id: 'déneigement',
      label: 'Déneigement',
      icon: <LocalShipping />,
      description: 'Services hivernaux',
      color: '#7b1fa2',
    },
  ]

  const steps = [
    'Informations de contact',
    'Type de projet',
    'Détails du projet',
    'Confirmation',
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProjectTypeSelect = (type) => {
    setFormData({
      ...formData,
      projectType: type,
    })
  }

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setActiveStep(steps.length)
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={800}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  InputAdornment={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Entreprise (optionnel)"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Adresse du projet"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  variant="outlined"
                  InputAdornment={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        )
      case 1:
        return (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 3, color: 'primary.main' }}
            >
              Sélectionnez le type de projet
            </Typography>
            <Grid container spacing={3}>
              {projectTypes.map((type, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={type.id}>
                  <Zoom in timeout={300 * (index + 1)}>
                    <Card
                      onClick={() => handleProjectTypeSelect(type.id)}
                      onMouseEnter={() => setHoveredCard(type.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform:
                          hoveredCard === type.id
                            ? 'translateY(-8px) scale(1.02)'
                            : 'translateY(0)',
                        boxShadow:
                          hoveredCard === type.id
                            ? theme.shadows[12]
                            : theme.shadows[2],
                        border:
                          formData.projectType === type.id
                            ? `3px solid ${type.color}`
                            : '1px solid transparent',
                        background:
                          formData.projectType === type.id
                            ? `linear-gradient(135deg, ${alpha(
                                type.color,
                                0.1
                              )} 0%, ${alpha(type.color, 0.05)} 100%)`
                            : 'background.paper',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(
                            type.color,
                            0.08
                          )} 0%, ${alpha(type.color, 0.03)} 100%)`,
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                          sx={{
                            color: type.color,
                            mb: 2,
                            transition: 'transform 0.3s ease',
                            transform:
                              hoveredCard === type.id
                                ? 'scale(1.2) rotate(5deg)'
                                : 'scale(1)',
                          }}
                        >
                          {React.cloneElement(type.icon, { fontSize: 'large' })}
                        </Box>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{ color: type.color, fontWeight: 'bold' }}
                        >
                          {type.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                        {formData.projectType === type.id && (
                          <Zoom in>
                            <CheckCircle sx={{ color: type.color, mt: 1 }} />
                          </Zoom>
                        )}
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      case 2:
        return (
          <Fade in timeout={800}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Surface approximative (m²)"
                  name="surface"
                  value={formData.surface}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Speed color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Budget estimé"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  variant="outlined"
                  InputAdornment={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Délai souhaité"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Urgence du projet
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['normal', 'urgent', 'très urgent'].map((urgency) => (
                      <Chip
                        key={urgency}
                        label={urgency}
                        onClick={() => setFormData({ ...formData, urgency })}
                        color={
                          formData.urgency === urgency ? 'primary' : 'default'
                        }
                        variant={
                          formData.urgency === urgency ? 'filled' : 'outlined'
                        }
                        sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description détaillée du projet"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={4}
                  InputAdornment={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Fade>
        )
      case 3:
        return (
          <Fade in timeout={800}>
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', mb: 3 }}
              >
                Résumé de votre demande
              </Typography>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background:
                    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 2,
                }}
              >
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contact"
                      secondary={`${formData.name} - ${formData.email}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Construction color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Type de projet"
                      secondary={formData.projectType}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Speed color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Surface"
                      secondary={`${formData.surface} m²`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Budget"
                      secondary={formData.budget}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DateRange color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Délai"
                      secondary={formData.deadline}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Fade>
        )
      default:
        return null
    }
  }

  if (activeStep === steps.length) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Zoom in timeout={800}>
          <Paper
            elevation={8}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 80, mb: 2, color: '#4caf50' }} />
            <Typography variant="h4" gutterBottom>
              Demande envoyée avec succès !
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Nous vous contacterons sous 24h pour discuter de votre projet.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setActiveStep(0)
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  company: '',
                  address: '',
                  projectType: '',
                  surface: '',
                  budget: '',
                  deadline: '',
                  description: '',
                  urgency: 'normal',
                })
              }}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Nouvelle demande
            </Button>
          </Paper>
        </Zoom>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Slide direction="down" in timeout={600}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 4,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Construction sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              Demande de Devis
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Travaux d'Asphalte & Revêtement
            </Typography>
          </Box>
        </Paper>
      </Slide>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '1.1rem',
                    fontWeight: activeStep === index ? 'bold' : 'normal',
                    color:
                      activeStep === index ? 'primary.main' : 'text.secondary',
                  },
                }}
              >
                {label}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>{getStepContent(index)}</Box>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={
                        index === steps.length - 1 ? handleSubmit : handleNext
                      }
                      disabled={isSubmitting}
                      sx={{
                        mt: 1,
                        mr: 1,
                        px: 3,
                        py: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[8],
                        },
                      }}
                      startIcon={index === steps.length - 1 ? <Send /> : null}
                    >
                      {isSubmitting
                        ? 'Envoi en cours...'
                        : index === steps.length - 1
                        ? 'Envoyer la demande'
                        : 'Continuer'}
                    </Button>
                    {index !== 0 && (
                      <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                        Retour
                      </Button>
                    )}
                  </div>
                </Box>
                {isSubmitting && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress />
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  )
}

export default Quote
