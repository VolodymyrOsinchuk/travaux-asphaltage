import { StrictMode, useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import createAppTheme from './theme'
import './index.css'

function Main() {
  // 1. Manage the theme mode (e.g., 'light' or 'dark')
  // You can set an initial mode, or get it from user preferences/system settings
  const [mode, setMode] = useState('light') // Start with 'light' mode as an example

  // 2. Create the theme object using useMemo to prevent re-creation on every render
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <StrictMode>
      {/* 3. Pass the created theme object to the ThemeProvider */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <ToastContainer position="top-center" />
      </ThemeProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Main />)
