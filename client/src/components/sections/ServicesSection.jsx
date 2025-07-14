import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
  Slide,
  Typography,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import {
  Build as BuildIcon,
  Construction as ConstructionIcon,
  Engineering as EngineeringIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material'

const ServicesSection = () => {
  const [visibleCards, setVisibleCards] = useState(new Set())

  const services = [
    {
      title: 'Asphaltage de Routes',
      description:
        "Nous réalisons des travaux d'asphaltage de haute qualité pour tous types de routes, garantissant durabilité et sécurité.",
      icon: <ConstructionIcon sx={{ fontSize: 40 }} />,
      color: '#FF6B35',
      features: [
        'Matériaux haute qualité',
        'Techniques modernes',
        'Respect des normes',
      ],
    },
    {
      title: 'Réparation de Nids-de-poule',
      description:
        'Notre équipe intervient rapidement pour réparer les nids-de-poule et autres dégradations de la chaussée.',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      color: '#4ECDC4',
      features: ['Intervention rapide', 'Réparation durable', 'Devis gratuit'],
    },
    {
      title: 'Resurfaçage',
      description:
        'Nous proposons des services de resurfaçage pour rénover et prolonger la durée de vie de vos routes existantes.',
      icon: <EngineeringIcon sx={{ fontSize: 40 }} />,
      color: '#45B7D1',
      features: ['Économique', 'Écologique', 'Résistant'],
    },
    {
      title: 'Marquage au Sol',
      description:
        'Nous réalisons des marquages au sol précis et durables pour améliorer la sécurité routière.',
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      color: '#96CEB4',
      features: [
        'Précision maximale',
        'Peinture longue durée',
        'Sécurité renforcée',
      ],
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll('.animate-card')
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect()
        if (rect.top < window.innerHeight - 100) {
          setVisibleCards((prev) => new Set([...prev, index]))
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={1000}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Nos Services
          </Typography>
        </Fade>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Des solutions complètes pour tous vos besoins d'asphaltage
        </Typography>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Slide
                direction="up"
                in={visibleCards.has(index)}
                timeout={500 + index * 100}
              >
                <Card
                  className="animate-card"
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.02)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${service.color}20, ${service.color}10)`,
                      p: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ color: service.color, mb: 2 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {service.title}
                    </Typography>
                  </Box>
                  <CardContent>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {service.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            bgcolor: `${service.color}20`,
                            color: service.color,
                            fontWeight: 'bold',
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default ServicesSection
