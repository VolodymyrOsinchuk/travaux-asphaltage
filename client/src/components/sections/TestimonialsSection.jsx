import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Rating,
  Typography,
  Zoom,
} from '@mui/material'
import React from 'react'

// Testimonials Component
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'Maire de Ville-sur-Route',
      rating: 5,
      comment:
        'Excellent travail sur le resurfaçage de nos routes principales. Équipe professionnelle et résultat parfait.',
      avatar: 'JD',
    },
    {
      name: 'Marie Martin',
      role: 'Directrice des Travaux',
      rating: 5,
      comment:
        'Intervention rapide et efficace pour la réparation des nids-de-poule. Service impeccable.',
      avatar: 'MM',
    },
    {
      name: 'Pierre Laurent',
      role: 'Gestionnaire de Parking',
      rating: 5,
      comment:
        'Marquage au sol précis et durable. Très satisfait du résultat et des délais respectés.',
      avatar: 'PL',
    },
  ]

  return (
    <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          textAlign="center"
          sx={{
            mb: 6,
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          Témoignages Clients
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }}>
              <Zoom in={true} timeout={1000 + index * 300}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#FF6B35',
                          mr: 2,
                          width: 50,
                          height: 50,
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating
                      value={testimonial.rating}
                      readOnly
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{testimonial.comment}"
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default TestimonialsSection
