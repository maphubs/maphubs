import * as React from 'react'

import UserStore from '../stores/UserStore'
import type { UserStoreState } from '../stores/UserStore'
import FloatingButton from './FloatingButton'
type Props = {
  tooltip?: string
  icon?: React.ReactNode
  onClick?: (...args: Array<any>) => any
  style?: Record<string, any>
  actionButtonStyles?: Record<string, any>
  position?: Record<string, any>
  children?: any
}
type State = UserStoreState
export default class FloatingAddButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore]
  }
  stores: any

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    if (!this.state.user && nextState.user) return true
    return false
  }

  render(): JSX.Element {
    // only render on the client side
    if (typeof window === 'undefined') {
      return ''
    }

    const { user } = this.state

    return user ? <FloatingButton {...this.props} /> : <></>
  }
}
