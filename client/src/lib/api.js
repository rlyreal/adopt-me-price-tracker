const configuredApiUrl = import.meta.env.VITE_API_URL
const defaultApiUrl = typeof window !== 'undefined' && window.location.protocol === 'file:'
  ? 'http://localhost:4000/api'
  : '/api'
const API_URL = (configuredApiUrl || defaultApiUrl).replace(/\/$/, '')

export function getToken() {
  return localStorage.getItem('petfolio_token')
}

export function logout() {
  localStorage.removeItem('petfolio_token')
}

function petFormData(data) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'image' && value instanceof File) formData.append('image', value)
    else if (key !== 'image' && value !== undefined && value !== null) formData.append(key, String(value))
  })
  return formData
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isFormData = options.body instanceof FormData
  if (!isFormData) headers.set('Content-Type', 'application/json')
  const body = !isFormData && options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  let response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, body, headers })
  } catch {
    throw new Error(`Unable to reach the API at ${API_URL}. Start the server or set VITE_API_URL.`)
  }
  if (response.status === 401) {
    logout()
    window.dispatchEvent(new Event('auth-expired'))
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`)
  }
  return payload
}

export const api = {
  login: (password) => request('/login', { method: 'POST', body: JSON.stringify({ password }) }),
  listPets: (params) => request(`/pets?${new URLSearchParams(params)}`),
  createPet: (data) => request('/pets', { method: 'POST', body: petFormData(data) }),
  updatePet: (id, data) => request(`/pets/${id}`, { method: 'PUT', body: petFormData(data) }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' })
}
