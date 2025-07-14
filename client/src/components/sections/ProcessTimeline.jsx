import React from 'react'
import {
  Box,
  Container,
  Fade,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'

const ProcessTimeline = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const processSteps = [
    {
      title: 'Évaluation',
      description: 'Analyse complète du terrain et des besoins',
    },
    { title: 'Devis', description: 'Proposition détaillée et transparente' },
    {
      title: 'Planification',
      description: 'Organisation optimale des travaux',
    },
    { title: 'Exécution', description: 'Réalisation avec matériaux premium' },
    { title: 'Contrôle', description: 'Vérification qualité et finitions' },
  ]

  return (
    <Box sx={{ py: 8, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          textAlign="center"
          sx={{
            mb: 6,
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          Notre Processus
        </Typography>
        <Timeline position={isMobile ? 'right' : 'alternate'}>
          {processSteps.map((step, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: '#FF6B35',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {index + 1}
                </TimelineDot>
                {index < processSteps.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Fade in={true} timeout={1000 + index * 200}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Paper>
                </Fade>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </Box>
  )
}

export default ProcessTimeline
