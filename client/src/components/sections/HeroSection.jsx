import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Fade,
  Typography,
  Button,
  Zoom,
} from '@mui/material'
import { Construction as ConstructionIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'
// Hero Section Component
const HeroSection = ({ onQuoteRequest }) => {
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 500)
  }, [])

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url(https://images.unsplash.com/photo-1635347730118-b3ae172fecbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          animation: 'parallax 20s infinite linear',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Fade in={heroLoaded} timeout={1000}>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  L'Excellence en Asphaltage
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    mb: 4,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                  }}
                >
                  Nous transformons vos routes avec expertise et innovation
                  depuis plus de 15 ans
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    LinkComponent={Link}
                    to="/quote"
                    sx={{
                      bgcolor: '#FF6B35',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#e55a2b',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 48px rgba(255, 107, 53, 0.4)',
                      },
                    }}
                  >
                    Devis Gratuit
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    LinkComponent={Link}
                    to="/projects"
                    sx={{
                      color: 'white',
                      borderColor: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-3px)',
                      },
                    }}
                  >
                    Nos Réalisations
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Zoom in={heroLoaded} timeout={1500}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: { xs: 200, md: 300 },
                    height: { xs: 200, md: 300 },
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF6B35, #4ECDC4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'float 3s ease-in-out infinite',
                  }}
                >
                  <ConstructionIcon
                    sx={{ fontSize: { xs: 80, md: 120 }, color: 'white' }}
                  />
                </Box>
              </Box>
            </Zoom>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HeroSection
