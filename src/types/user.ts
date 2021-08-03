export interface User {
  id: number
  email: string
  role: string
  terms_accepted?: boolean
  config?: Record<string, unknown>
}
