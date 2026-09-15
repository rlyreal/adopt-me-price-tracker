const API_URL = import.meta.env.VITE_API_URL || '/api'

export function getToken() {
  return localStorage.getItem('petfolio_token')
}

export function logout() {
  localStorage.removeItem('petfolio_token')
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const isFormData = options.body instanceof FormData
  if (!isFormData) headers.set('Content-Type', 'application/json')
  const body = !isFormData && options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  const response = await fetch(`${API_URL}${path}`, { ...options, body, headers })
  if (response.status === 401) {
    logout()
    window.dispatchEvent(new Event('auth-expired'))
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Request failed')
  return payload
}

export const api = {
  login: (password) => request('/login', { method: 'POST', body: JSON.stringify({ password }) }),
  listPets: (params) => request(`/pets?${new URLSearchParams(params)}`),
  createPet: (formData) => request('/pets', { method: 'POST', body: formData }),
  updatePet: (id, formData) => request(`/pets/${id}`, { method: 'PUT', body: formData }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' })
}
