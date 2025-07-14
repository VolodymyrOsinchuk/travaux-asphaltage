import { Box, Container, Typography } from '@mui/material'

const Footer = () => {
  return (
    <Box
      sx={{ bgcolor: '#35424a', color: 'white', py: 4, textAlign: 'center' }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1">
          © 2025 Travaux Asphaltage. Tous droits réservés.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          Excellence • Innovation • Durabilité
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
