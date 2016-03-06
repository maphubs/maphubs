var React = require('react');
var ReactNotification = require('react-notification');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var NotificationStore = require('../stores/NotificationStore');
var NotificationActions = require('../actions/NotificationActions');

var Notification = React.createClass({

  mixins:[StateMixin.connect(NotificationStore)],

  onDismiss(){
    NotificationActions.dismissNotification();
  },

  render() {
    var position = {};
    switch(this.state.position) {
      case 'topright':
        position = {top: '60px', right: '20px', bottom: undefined, left: undefined};
        break;
      case 'bottomright':
        position = {top: undefined, right: '20px', bottom: '60px', left: undefined};
        break;
      case 'topleft':
        position = {top: '60px', right: undefined, bottom: undefined, left: '20px'};
        break;
      case 'bottomleft':
        position = {top: undefined, right: undefined, bottom: '60px', left: '20px'};
        break;

      default: break;
    }

    return (
      <ReactNotification
        id="omh-notification"
        isActive={this.state.isActive}
        message={this.state.message}
        action={this.state.action}
        onClick={this.state.onClick}
        dismissAfter={this.state.dismissAfter}
        onDismiss={this.onDismiss}
        style={{
          bar: {background: this.state.backgroundColor},
          action: {color: this.state.color},
          active: position
        }}
      />
    );

  }
});

module.exports = Notification;
