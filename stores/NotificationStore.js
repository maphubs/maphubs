var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/NotificationActions');
var debug = require('../services/debug')('stores/notification-store');
var $ = require('jquery');
var config = require('../clientconfig');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return {
      isActive: false,
      message: '',
      action: null,
      onClick() {},
      backgroundColor: config.primaryColor,
      color: 'white',
      position: 'topright',
      dismissAfter: 3000,
      onDismiss() {
      }
    };
  },

  reset() {
    this.setState(this.getInitialState());
    this.trigger(this.state);
  },

  storeDidUpdate() {
    debug('store updated');
  },

  //listeners
  showNotification(options) {
    if (options) {
      var updatedState = $.extend(this.getInitialState(), options);
      this.setState(updatedState);
      this.setState({
        isActive: true
      });
    }
  },

  dismissNotification() {
    this.state.onDismiss();
    this.reset();
  }


});
