import React from 'react' // Import React
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  useTheme, // Import useTheme hook
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Info as InfoIcon,
  Contacts as ContactIcon,
  RequestQuote as QuoteIcon,
  Article as BlogIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom' // Import useLocation

const Header = ({ isMobile, handleDrawerToggle }) => {
  const theme = useTheme() // Access the theme
  const location = useLocation() // Get current location for active button state

  const menuItems = [
    { text: 'Accueil', icon: <HomeIcon />, path: '/' },
    { text: 'Services', icon: <BusinessIcon />, path: '/services' },
    { text: 'Projets', icon: <WorkIcon />, path: '/projects' },
    { text: 'À Propos', icon: <InfoIcon />, path: '/about' },
    { text: 'Contact', icon: <ContactIcon />, path: '/contact' },
    { text: 'Devis', icon: <QuoteIcon />, path: '/quote' },
    { text: 'Blog', icon: <BlogIcon />, path: '/blog' },
    { text: 'Admin', icon: <AdminIcon />, path: '/admin' },
  ]

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // Apply the same gradient background
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', // Ensure text color is white for contrast
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Travaux Asphaltage
        </Typography>
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {menuItems.slice(0, -1).map((item) => (
              <Button
                key={item.text}
                color="inherit" // Use inherit to pick up AppBar's white color
                component={Link}
                to={item.path}
                variant={location.pathname === item.path ? 'outlined' : 'text'}
                // Adjust outlined variant border color for better visibility on gradient
                sx={
                  location.pathname === item.path
                    ? { borderColor: 'white' }
                    : {}
                }
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
