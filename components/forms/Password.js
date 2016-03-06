var React = require('react');
var Formsy = require('formsy-react');
var TextInput = require('../forms/textInput');

var MessageActions = require('../../actions/MessageActions');
var NotificationActions = require('../../actions/NotificationActions');
var UserActions = require('../../actions/UserActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var Password = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSave: React.PropTypes.func,
    userid: React.PropTypes.number,
    passreset:  React.PropTypes.string

  },


  getInitialState() {
    return {
      canSubmit: false
    };
  },

  enableButton () {
      this.setState({
        canSubmit: true
      });
    },
    disableButton () {
      this.setState({
        canSubmit: false
      });
    },

  onSave(model){
    var _this = this;
    UserActions.updatePassword(this.props.userid, model.password, this.props.passreset, function(err){
      if(err){
        MessageActions.showMessage({
          title: _this.__('Failed to Update Password'),
          message: err.error
        });
      }else {
        NotificationActions.showNotification(
          {
            message: _this.__('Password Updated'),
            position: 'bottomright',
            dismissAfter: 3000,
            onDismiss() {
              if(_this.props.onSave) _this.props.onSave();
            }
        });
      }
    });
  },

render(){

  return (
    <div>
    <Formsy.Form onValidSubmit={this.onSave} onValid={this.enableButton} onInvalid={this.disableButton}>
      <div className="row">
        <TextInput name="password" label={this.__('New Password')} icon="vpn_key" className="col s12"
              validations={{maxLength:25, minLength:8}} validationErrors={{
               maxLength: this.__('Too Long. Please use no more than 25 characters.'),
              minLength: this.__('Must be at least 8 characters')
           }} length={25}
           successText={this.__('Valid Password')}
           type="password"
           required/>
      </div>
      <div className="row">
        <TextInput name="password_confirmation" label={this.__('Confirm Password')} icon="repeat" className="col s12" validations="equalsField:password" validationErrors={{
               equalsField: this.__('Passwords do not match.')
           }} length={25}
           successText={this.__('Passwords Match')}
           type="password"
           required/>
      </div>
      <div className="right">
          <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}>{this.__('Save')}</button>
      </div>
    </Formsy.Form>
    </div>
  );
}

});

module.exports = Password;
