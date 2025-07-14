import { useState } from 'react'
import { Box } from '@mui/material'
import HeroSection from '../components/sections/HeroSection'
import StatsSection from '../components/sections/StatsSection'
import ServicesSection from '../components/sections/ServicesSection'
import ProcessTimeline from '../components/sections/ProcessTimeline'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import ContactSection from '../components/sections/ContactSection'
import ScrollToTopFAB from '../components/sections/ScrollToTopFAB'
import '../styles/home.css'
const Home = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleQuoteRequest = () => {
    setOpenSnackbar(true)
  }
  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f8f9fa' }}>
      <HeroSection onQuoteRequest={handleQuoteRequest} />
      <StatsSection />
      <ServicesSection />
      <ProcessTimeline />
      <TestimonialsSection />
      <ContactSection onQuoteRequest={handleQuoteRequest} />
      <ScrollToTopFAB />

      {/* Snackbar for notifications */}
      {/* <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Merci pour votre intérêt ! Nous vous contacterons sous 24h.
        </Alert>
      </Snackbar> */}

      {/* CSS Animations */}
    </Box>
  )
}

export default Home
