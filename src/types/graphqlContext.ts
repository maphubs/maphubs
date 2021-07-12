export interface Context {
  user: {
    sub: number
    role?: string
  }
}
