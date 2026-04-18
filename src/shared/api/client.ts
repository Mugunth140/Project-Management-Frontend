import axios from 'axios'
import { clearSession, getAuthToken } from '../lib/storage'

const apiBasePath = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: apiBasePath,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined
    if (status === 401) {
      clearSession()
    }

    return Promise.reject(error)
  },
)
