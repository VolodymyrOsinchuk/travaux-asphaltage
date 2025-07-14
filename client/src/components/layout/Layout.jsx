import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Drawer,
  IconButton,
  useMediaQuery,
  Divider,
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
import Footer from './Footer'
import Header from './Header'

// Layout Component
const Layout = () => {
  const theme = createTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

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

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Travaux Asphaltage
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            // button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            <Box sx={{ mr: 2 }}>{item.icon}</Box>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <Header isMobile={isMobile} handleDrawerToggle={handleDrawerToggle} />
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 250,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar />
        <Outlet />
        <Footer />
      </Box>
    </Box>
  )
}

export default Layout
