import NextAuth from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: {
      id: number
      email: string
      /** The user's role */
      role: string
      terms_accepted?: boolean
    }
  }
}
