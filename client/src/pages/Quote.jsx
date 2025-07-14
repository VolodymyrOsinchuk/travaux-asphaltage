import React, { useState } from 'react'
import {
  Typography,
  Button,
  Container,
  Grid,
  TextField,
  Paper,
} from '@mui/material'

const Quote = () => {
  const [projectType, setProjectType] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    deadline: '',
    description: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Demande de Devis
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Nom"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Entreprise"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label="Type de projet"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              SelectProps={{ native: true }}
            >
              <option value="">Sélectionner</option>
              <option value="web">Site Web</option>
              <option value="mobile">App Mobile</option>
              <option value="consulting">Consulting</option>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Budget estimé"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Délai souhaité"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Description du projet"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid size={12}>
            <Button variant="contained" size="large" fullWidth>
              Envoyer la demande
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default Quote
