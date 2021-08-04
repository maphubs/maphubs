import { User } from 'next-auth'
import UserModel from '../models/user'

const isAdmin = (user: User): boolean => {
  return user?.role === 'admin'
}

const isMember = async (user: User): Promise<boolean> => {
  let sub: number

  if (user?.sub && typeof user.sub === 'string') {
    sub = Number.parseInt(user.sub)
  }

  // get the user
  const dbUser = await UserModel.byID(sub || (user.id as number)) // *object passed in may be the session or the jwt, the jwt uses "sub" for the id

  if (dbUser && (dbUser.role === 'member' || dbUser.role === 'admin')) {
    return true
  }

  return
}

const isMemberEmail = async (email: string): Promise<boolean> => {
  // get the user
  const dbUser = await UserModel.byEmail(email)

  if (dbUser) {
    return true
  }
  return false
}

export { isAdmin, isMember, isMemberEmail }
