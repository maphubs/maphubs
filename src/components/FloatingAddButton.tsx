import React from 'react'
import { useSession } from 'next-auth/client'
import FloatingButton from './FloatingButton'
type Props = {
  tooltip?: string
  icon?: JSX.Element
  onClick?: (...args: Array<any>) => any
  style?: Record<string, any>
  actionButtonStyles?: Record<string, any>
  position?: Record<string, any>
  children?: any
}

const FloatingAddButton = (props: Props): JSX.Element => {
  const [session, loading] = useSession()

  let user
  if (!loading) {
    user = session?.user
  }

  // only render on the client side
  if (typeof window === 'undefined') {
    return <></>
  }

  return user ? <FloatingButton {...props} /> : <></>
}
export default FloatingAddButton
