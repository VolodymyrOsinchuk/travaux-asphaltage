// import React, { useState, createContext, useContext } from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material'
// import {
//   Menu as MenuIcon,
//   Home as HomeIcon,
//   Build as BuildIcon,
//   Work as WorkIcon,
//   Info as InfoIcon,
//   Contact as ContactIcon,
//   RequestQuote as QuoteIcon,
//   Article as BlogIcon,
//   Dashboard as DashboardIcon,
//   Close as CloseIcon,
//   Phone as PhoneIcon,
//   Email as EmailIcon,
//   LocationOn as LocationIcon,
//   Star as StarIcon,
//   TrendingUp as TrendingUpIcon,
//   People as PeopleIcon,
//   CheckCircle as CheckCircleIcon,
//   ArrowUpward as ArrowUpwardIcon,
// } from '@mui/icons-material'

// // Page d'accueil
// const Home = () => {
//   const services = [
//     {
//       title: 'Développement Web',
//       description: 'Applications web modernes et performantes',
//       icon: '🌐',
//     },
//     {
//       title: 'Mobile Apps',
//       description: 'Applications mobiles natives et cross-platform',
//       icon: '📱',
//     },
//     {
//       title: 'Consulting',
//       description: 'Conseils et stratégies technologiques',
//       icon: '💡',
//     },
//     {
//       title: 'Maintenance',
//       description: 'Support et maintenance de vos applications',
//       icon: '🔧',
//     },
//   ]

//   const stats = [
//     { value: '100+', label: 'Projets réalisés' },
//     { value: '50+', label: 'Clients satisfaits' },
//     { value: '5+', label: "Années d'expérience" },
//     { value: '24/7', label: 'Support technique' },
//   ]

//   return (
//     <Box>
//       {/* Hero Section */}
//       <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
//         <Container maxWidth="lg">
//           <Grid container spacing={4} alignItems="center">
//             <Grid size={{ xs: 12, md: 8 }}>
//               <Typography variant="h1" gutterBottom>
//                 Votre partenaire technologique
//               </Typography>
//               <Typography variant="h5" gutterBottom>
//                 Nous développons des solutions digitales innovantes pour votre
//                 entreprise
//               </Typography>
//               <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//                 <Button variant="contained" color="secondary" size="large">
//                   Nos Services
//                 </Button>
//                 <Button variant="outlined" color="inherit" size="large">
//                   Demander un devis
//                 </Button>
//               </Box>
//             </Grid>
//             <Grid size={{ xs: 12, md: 4 }}>
//               <Box sx={{ textAlign: 'center' }}>
//                 <Typography variant="h2">🚀</Typography>
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       {/* Services Section */}
//       <Container maxWidth="lg" sx={{ py: 8 }}>
//         <Typography variant="h2" textAlign="center" gutterBottom>
//           Nos Services
//         </Typography>
//         <Grid container spacing={4} sx={{ mt: 4 }}>
//           {services.map((service, index) => (
//             <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
//               <Card sx={{ height: '100%', textAlign: 'center' }}>
//                 <CardContent>
//                   <Typography variant="h1" sx={{ mb: 2 }}>
//                     {service.icon}
//                   </Typography>
//                   <Typography variant="h6" gutterBottom>
//                     {service.title}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     {service.description}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       {/* Stats Section */}
//       <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
//         <Container maxWidth="lg">
//           <Grid container spacing={4}>
//             {stats.map((stat, index) => (
//               <Grid key={index} size={{ xs: 6, md: 3 }}>
//                 <Paper sx={{ p: 3, textAlign: 'center' }}>
//                   <Typography variant="h3" color="primary" gutterBottom>
//                     {stat.value}
//                   </Typography>
//                   <Typography variant="body1">{stat.label}</Typography>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </Box>
//     </Box>
//   )
// }

// export default Home
import React from 'react'

// Page d'accueil
const Home = () => {
  const services = [
    {
      title: 'Développement Web',
      description: 'Applications web modernes et performantes',
      icon: '🌐',
    },
    {
      title: 'Mobile Apps',
      description: 'Applications mobiles natives et cross-platform',
      icon: '📱',
    },
    {
      title: 'Consulting',
      description: 'Conseils et stratégies technologiques',
      icon: '💡',
    },
    {
      title: 'Maintenance',
      description: 'Support et maintenance de vos applications',
      icon: '🔧',
    },
  ]

  const stats = [
    { value: '100+', label: 'Projets réalisés' },
    { value: '50+', label: 'Clients satisfaits' },
    { value: '5+', label: "Années d'expérience" },
    { value: '24/7', label: 'Support technique' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h1" gutterBottom>
                Votre partenaire technologique
              </Typography>
              <Typography variant="h5" gutterBottom>
                Nous développons des solutions digitales innovantes pour votre
                entreprise
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" color="secondary" size="large">
                  Nos Services
                </Button>
                <Button variant="outlined" color="inherit" size="large">
                  Demander un devis
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2">🚀</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" textAlign="center" gutterBottom>
          Nos Services
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {services.map((service, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h1" sx={{ mb: 2 }}>
                    {service.icon}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid key={index} size={{ xs: 6, md: 3 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1">{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default Home
