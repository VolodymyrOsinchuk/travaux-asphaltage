import React from 'react'
import {
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
const About = () => {
  const team = [
    { name: 'Jean Dupont', role: 'CEO & Founder', avatar: '👨‍💼' },
    { name: 'Marie Martin', role: 'CTO', avatar: '👩‍💻' },
    { name: 'Pierre Durand', role: 'Lead Developer', avatar: '👨‍💻' },
    { name: 'Sophie Moreau', role: 'Designer UX/UI', avatar: '👩‍🎨' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        À propos de nous
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="body1" paragraph>
            Notre entreprise est spécialisée dans le développement de solutions
            digitales innovantes. Depuis 2019, nous accompagnons nos clients
            dans leur transformation numérique.
          </Typography>
          <Typography variant="body1" paragraph>
            Notre équipe de développeurs expérimentés maîtrise les dernières
            technologies pour créer des applications web et mobiles performantes
            et sécurisées.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3">🏆</Typography>
            <Typography variant="h6" gutterBottom>
              Notre Mission
            </Typography>
            <Typography variant="body2">
              Créer des solutions technologiques qui transforment votre business
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" sx={{ mt: 6, mb: 3 }}>
        Notre Équipe
      </Typography>
      <Grid container spacing={3}>
        {team.map((member, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  {member.avatar}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.role}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default About
