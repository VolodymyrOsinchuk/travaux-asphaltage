import React from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
const Services = () => {
  const services = [
    {
      title: 'Développement Web',
      description: 'Applications web modernes avec React, Vue.js, Angular',
      price: 'À partir de 2000€',
      features: ['Design responsive', 'SEO optimisé', 'Performance élevée'],
      image: '🌐',
    },
    {
      title: 'Applications Mobile',
      description: 'Apps natives iOS/Android et cross-platform',
      price: 'À partir de 5000€',
      features: [
        'Interface intuitive',
        'Notifications push',
        'Offline support',
      ],
      image: '📱',
    },
    {
      title: 'Consulting IT',
      description: 'Conseils stratégiques et audits techniques',
      price: 'À partir de 800€/jour',
      features: ['Audit de code', 'Architecture système', 'Formation équipe'],
      image: '💡',
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Nos Services
      </Typography>
      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="h1">{service.image}</Typography>
                </Box>
                <Typography variant="h5" gutterBottom>
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {service.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                  {service.price}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {service.features.map((feature, idx) => (
                    <Chip key={idx} label={feature} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
                <Button variant="contained" fullWidth>
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default Services
