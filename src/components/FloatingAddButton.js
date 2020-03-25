// @flow
import * as React from 'react'
import MapHubsComponent from './MapHubsComponent'
import UserStore from '../stores/UserStore'
import type {UserStoreState} from '../stores/UserStore'
import FloatingButton from './FloatingButton'

type Props = {
  tooltip?: string,
  icon?: React.Node,
  onClick?: Function,
  style?: Object,
  actionButtonStyles?: Object,
  position?: Object,
  children?: any
}
type State = UserStoreState

export default class FloatingAddButton extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    if (!this.state.user && nextState.user) return true
    return false
  }

  render () {
    // only render on the client side
    if (typeof window === 'undefined') {
      return ''
    }

    const {user} = this.state

    if (user) {
      return (
        <FloatingButton {...this.props} />
      )
    } else {
      return ''
    }
  }
}
