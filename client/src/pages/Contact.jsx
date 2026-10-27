import React, { useState } from 'react'
import {
  Typography,
  Button,
  Box,
  Container,
  Grid,
  TextField,
  Paper,
  Alert,
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import customFetch from '../utils/customFetch'
// Page Contact
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitStatus, setSubmitStatus] = useState(null) // 'idle' | 'submitting' | 'success' | 'error'
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('submitting')
    setSubmitError(null)
    try {
      await customFetch.post('/contacts', {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: 'Demande de contact depuis le site',
      })
      setSubmitStatus('success')
    } catch (error) {
      setSubmitStatus('error')
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          'Une erreur est survenue lors de l\'envoi du message.'
      )
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Contactez-nous
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Envoyez-nous un message
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
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
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid size={12}>
                  {submitStatus === 'success' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Votre message a été envoyé avec succès !
                    </Alert>
                  )}
                  {submitStatus === 'error' && submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {submitError}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitStatus === 'submitting'}
                  >
                    {submitStatus === 'submitting' ? 'Envoi en cours...' : 'Envoyer'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations de contact
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 2 }} />
              <Typography>+33 1 23 45 67 89</Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 2 }} />
              <Typography>contact@monentreprise.com</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon sx={{ mr: 2 }} />
              <Typography>123 Rue de la Tech, 75001 Paris</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Contact
