import React from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material'

const Projects = () => {
  const projects = [
    {
      title: 'E-commerce Platform',
      description: 'Plateforme de vente en ligne complète',
      tech: ['React', 'Node.js', 'MongoDB'],
      image: '🛒',
      status: 'Terminé',
    },
    {
      title: 'App Mobile Banking',
      description: 'Application bancaire mobile sécurisée',
      tech: ['React Native', 'TypeScript', 'Firebase'],
      image: '💳',
      status: 'En cours',
    },
    {
      title: 'Dashboard Analytics',
      description: "Tableau de bord d'analyse de données",
      tech: ['Vue.js', 'Python', 'PostgreSQL'],
      image: '📊',
      status: 'Terminé',
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Nos Projets
      </Typography>
      <Grid container spacing={4}>
        {projects.map((project, index) => (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h4">{project.image}</Typography>
                  <Chip
                    label={project.status}
                    color={project.status === 'Terminé' ? 'success' : 'warning'}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {project.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {project.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {project.tech.map((tech, idx) => (
                    <Chip
                      key={idx}
                      label={tech}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Button variant="outlined" fullWidth>
                  Voir le projet
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
export default Projects
