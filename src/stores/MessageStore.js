import Reflux from 'reflux'
import Actions from '../actions/MessageActions'
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('stores/message-store')
const $ = require('jquery')

export type MessageStoreState = {
  show: boolean,
  title: string,
  message: string,
  onDismiss?: Function
}

export default class MessageStore extends Reflux.Store {
  state: MessageStoreState

  constructor () {
    super()
    this.state = this.getDefaultState()
    this.listenables = Actions
  }

  getDefaultState (): MessageStoreState {
    return {
      show: false,
      title: 'Message',
      message: '',
      onDismiss: null
    }
  }

  reset () {
    this.setState(this.getDefaultState())
    this.trigger(this.state)
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  // listeners
  showMessage (options) {
    if (options) {
      const updatedState = $.extend(this.getDefaultState(), options)
      this.setState(updatedState)
      this.setState({
        show: true
      })
    }
  }

  dismissMessage () {
    if (this.state.onDismiss) this.state.onDismiss()
    this.reset()
  }
}
