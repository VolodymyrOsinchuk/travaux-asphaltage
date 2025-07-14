import axios from 'axios'
import { toast } from 'react-toastify'
console.log('import.meta.env', import.meta.env)

let apiUrl

if (import.meta.env.MODE === 'development') {
  apiUrl = 'http://localhost:5000'
} else {
  apiUrl = 'https://travaux-asphaltage.onrender.com'
}

const customFetch = axios.create({
  baseURL: `${apiUrl}/api/v1`, // URL de base adaptée à vos endpoints
  withCredentials: true,
})

export default customFetch
