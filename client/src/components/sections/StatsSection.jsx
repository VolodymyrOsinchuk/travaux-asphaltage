import React from 'react'
import { Box, Container, Grid, Grow, Paper, Typography } from '@mui/material'
import {
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material'
// Stats Section Component
const StatsSection = () => {
  const stats = [
    {
      value: '500+',
      label: 'Projets réalisés',
      icon: <TrendingUpIcon />,
      color: '#FF6B35',
    },
    {
      value: '300+',
      label: 'Clients satisfaits',
      icon: <PeopleIcon />,
      color: '#4ECDC4',
    },
    {
      value: '15+',
      label: "Années d'expérience",
      icon: <StarIcon />,
      color: '#45B7D1',
    },
    {
      value: '24/7',
      label: 'Support technique',
      icon: <SpeedIcon />,
      color: '#96CEB4',
    },
  ]

  return (
    <Box sx={{ py: 8, bgcolor: 'white', position: 'relative' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid key={index} size={{ xs: 6, md: 3 }}>
              <Grow in={true} timeout={1000 + index * 200}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                  <Typography
                    variant="h3"
                    sx={{ color: stat.color, fontWeight: 'bold' }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
export default StatsSection
