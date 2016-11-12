var React = require('react');
var Formsy = require('formsy-react');
var TextInput = require('../forms/textInput');

var UserActions = require('../../actions/UserActions');
var NotificationActions = require('../../actions/NotificationActions');
var MessageActions = require('../../actions/MessageActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var OnboardingLinks = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  getInitialState(){
    return {
      valid: false,
      placeholder: null,
      email: ''
    };
  },

  onValid() {
    this.setState({
      valid: true
    });
  },

  onInvalid() {
    this.setState({
      valid: false
    });
  },

  onSubmit(model){
    var _this = this;
    if(this.state.valid){
      UserActions.joinMailingList(model.email, this.state._csrf, function(err){
        if(err){
          MessageActions.showMessage({title: err.title, message: err.detail});
        }else {
          _this.setState({email: _this.state.email, placeholder: _this.__('Thanks for signing up!')});
          NotificationActions.showNotification(
            {
              message: _this.__('Added ' + model.email +' to the list. Thanks for joining!'),
              position: 'topright'
          });
        }
      });
    }else{
      NotificationActions.showNotification(
        {
          message: _this.__('Please enter a valid email address'),
          position: 'topright'
      });
    }
  },

render(){
  var _this = this;

  var placeholder = this.state.placeholder ? this.state.placeholder : _this.__('Sign up for our mailing list');
  return (
    <div className="row" style={{margin: '20px'}}>

      <Formsy.Form onSubmit={this.onSubmit} onValid={this.onValid} onInvalid={this.onInvalid}>
        <div className="col s12 m4 offset-m4">
            <TextInput name="email" label="" placeholder={placeholder}
              className="left no-margin no-padding mailing-list-text-input"
                  validations={{isEmail:true}} validationErrors={{
                   isEmail: this.__('Not a valid email address.')
               }}
               showCharCount={false}
               useMaterialize={false}
               value={this.state.email}
               onClick={function(){
                 _this.setState({placeholder: _this.__('Enter your email address')});
               }}
               required/>
             <button type="submit" className="left waves-effect waves-light btn"
              style={{
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '25px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '25px',
                boxShadow:'none',
                height: '40px',
                width: '25%',
                paddingLeft: 0,
                paddingRight: 0,
                textTransform: 'none'
              }}>{this.__('Sign up')}</button>
          </div>
      </Formsy.Form>

      </div>
  );
}

});

module.exports = OnboardingLinks;
