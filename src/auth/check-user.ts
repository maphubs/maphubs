import UserModel from '../models/user'
import { Context } from '../types/graphqlContext'

const isAdmin = (user: Context['user']): boolean => {
  return user?.role === 'admin'
}

const isMember = async (user: {
  sub?: number | string
  id?: number
}): Promise<string | void> => {
  let sub: number

  if (user?.sub && typeof user.sub === 'string') {
    sub = Number.parseInt(user.sub)
  }

  // get the user
  const dbUser = await UserModel.getUser(sub || user.id) // object passed in may be the session or the jwt, the jwt uses "sub" for the id

  if (dbUser) {
    // is their account active
    const isActive = dbUser.account?.active

    if (isActive) {
      // account is active, now get their pricing tier
      const tier = dbUser.account?.pricing?.tier
      return tier
    }
  }

  return
}

const isMemberEmail = async (email: string): Promise<boolean> => {
  // get the user
  const dbUser = await UserModel.getUserByEmail(email) // object passed in may be the session or the jwt, the jwt uses "sub" for the id

  if (dbUser) {
    // is their account active
    return dbUser.account?.active
  }

  return false
}

export { isAdmin, isMember, isMemberEmail }
