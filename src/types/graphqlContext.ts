export interface Context {
  user: {
    sub: string
    role?: string
  }
}
