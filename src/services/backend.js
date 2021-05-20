import axios from 'axios'

export const setupBackend = () => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000',
  })

  return client
}
