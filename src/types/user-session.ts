import { DefaultSession } from 'next-auth'

export type MapHubsUserSession = DefaultSession['user'] & { admin: boolean }
