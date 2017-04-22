import Reflux from 'reflux';
import Actions from '../actions/NotificationActions';
var debug = require('../services/debug')('stores/notification-store');
var $ = require('jquery');

export default class NotificationStore extends Reflux.Store {

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(){
    return {
      isActive: false,
      message: '',
      action: null,
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
    debug('store updated');
  }

  //listeners
  showNotification(options) {
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
