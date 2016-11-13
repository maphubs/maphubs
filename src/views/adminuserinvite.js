var React = require('react');
var Formsy = require('formsy-react');
var TextInput = require('../components/forms/textInput');
var Header = require('../components/header');
var Footer = require('../components/footer');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var NotificationActions = require('../actions/NotificationActions');
import Progress from '../components/Progress';
var MessageActions = require('../actions/MessageActions');
var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;

var PasswordReset = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired
  },

  getInitialState(){
    return {
      canSubmit: false,
      saving: false
    };
  },

  enableButton() {
    this.setState({
      canSubmit: true
    });
  },

  disableButton() {
    this.setState({
      canSubmit: false
    });
  },

  onSubmit(model){
    var _this = this;
    this.setState({saving: true});
    request.post('/admin/invite/send')
    .type('json').accept('json')
    .send({email: model.email, _csrf: this.state._csrf})
    .end(function(err, res){
      checkClientError(res, err, function(err){
        _this.setState({saving: false});
        if(err){
          MessageActions.showMessage({title: _this.__('Failed to Send Invite'), message: err.error});
        }else {
          NotificationActions.showNotification(
            {
              message: _this.__('Invite Sent'),
              position: 'topright',
              dismissAfter: 3000,
              onDismiss() {
                window.location='/';
              }
          });
        }
      },
      function(cb){
        cb();
      });
    });
  },

  render() {
    return (
      <div>
        <Header />
        <main className="container">
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
                <Formsy.Form onValidSubmit={this.onSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
                  <div className="row" style={{margin: '25px'}}>
                    <TextInput name="email" label={this.__('Email to Invite')} icon="email" className="col s12"
                          validations={{isEmail:true}} validationErrors={{
                           isEmail: this.__('Not a valid email address.')
                       }} length={50}
                       required/>

                  </div>
                  <div className="row">
                    <div className="col s12 valign-wrapper">
                          <button type="submit" className="valign waves-effect waves-light btn" style={{margin: 'auto'}} disabled={!this.state.canSubmit}>{this.__('Send Invite')}</button>
                    </div>
                  </div>

                </Formsy.Form>
            </div>
          </div>
          <Progress id="saving-user-invite" title={this.__('Sending')} subTitle="" dismissible={false} show={this.state.saving}/>
      </main>
      <Footer />
      </div>
    );
  }
});

module.exports = PasswordReset;
