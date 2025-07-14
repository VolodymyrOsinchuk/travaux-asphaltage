import { Fab, Zoom } from '@mui/material'
import { useState, useEffect } from 'react'
import { ArrowUpward as ArrowUpwardIcon } from '@mui/icons-material'
// Scroll to Top FAB Component
const ScrollToTopFAB = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Zoom in={showScrollTop}>
      <Fab
        color="primary"
        aria-label="scroll to top"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: '#FF6B35',
          '&:hover': {
            bgcolor: '#e55a2b',
          },
        }}
      >
        <ArrowUpwardIcon />
      </Fab>
    </Zoom>
  )
}

export default ScrollToTopFAB
