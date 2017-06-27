//@flow
import Reflux from 'reflux';
import Actions from '../actions/NotificationActions';
var debug = require('../services/debug')('stores/notification-store');
var $ = require('jquery');

export type NotificationStoreState = {
  isActive: boolean,
  message: string,
  action?: string,
  onClick: Function,
  backgroundColor: string,
  color: string,
  position: string,
  dismissAfter: number,
  onDismiss: Function
}

export default class NotificationStore extends Reflux.Store {

  state: NotificationStoreState

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(): NotificationStoreState{
    return {
      isActive: false,
      message: '',
      onClick() {},
      backgroundColor: MAPHUBS_CONFIG.primaryColor,
      color: 'white',
      position: 'topright',
      dismissAfter: 3000,
      onDismiss() {
      }
    };
  }

  reset() {
    this.setState(this.getDefaultState());
    this.trigger(this.state);
  }

  storeDidUpdate() {
    debug.log('store updated');
  }

  //listeners
  showNotification(options: NotificationStoreState) {
    if (options) {
      var updatedState = $.extend(this.getDefaultState(), options);
      this.setState(updatedState);
      this.setState({
        isActive: true
      });
    }
  }

  dismissNotification() {
    this.state.onDismiss();
    this.reset();
  }
}
