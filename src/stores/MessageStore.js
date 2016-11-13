var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/MessageActions');
var debug = require('../services/debug')('stores/message-store');
var $ = require('jquery');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return {
      show: false,
      title: 'Message',
      message: '',
      onDismiss: null
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
  showMessage(options) {
    if (options) {
      var updatedState = $.extend(this.getInitialState(), options);
      this.setState(updatedState);
      this.setState({
        show: true
      });
    }
  },

  dismissMessage() {
    if(this.state.onDismiss) this.state.onDismiss();
    this.reset();
  }


});
