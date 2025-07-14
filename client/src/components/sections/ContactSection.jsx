import { Box, Button, Container, Typography } from '@mui/material'
import React from 'react'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material'
// Contact CTA Component
const ContactSection = ({ onQuoteRequest }) => {
  return (
    <Box
      sx={{
        py: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
          Prêt à Démarrer Votre Projet ?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Contactez-nous dès aujourd'hui pour un devis personnalisé et gratuit
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
            startIcon={<PhoneIcon />}
            onClick={onQuoteRequest}
            sx={{
              bgcolor: '#FF6B35',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#e55a2b',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Appelez-nous
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon />}
            sx={{
              bgcolor: '#4ECDC4',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#45b7b8',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Email
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            sx={{
              bgcolor: '#25D366',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#22c55e',
                transform: 'translateY(-2px)',
              },
            }}
          >
            WhatsApp
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default ContactSection
