//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../components/forms/textInput';
import Notification from '../components/Notification';
import NotificationActions from '../actions/NotificationActions';
import UserActions from '../actions/UserActions';
import '../stores/UserStore'; //needs to be here so webpack knows to load it
import Message from '../components/message';
import MessageActions from '../actions/MessageActions';
import LocaleStore from '../stores/LocaleStore';
import Reflux from '../components/Rehydrate';
import MapHubsComponent from '../components/MapHubsComponent';

export default class Login extends MapHubsComponent {

  props: {
    name: string,
    failed: boolean,
    locale: string,
    _csrf: string,
    showSignup: boolean
  }

  static defaultProps = {
    name: 'No name',
    failed: false,
    showSignup: true
  }

  state = {
    canSubmit: false
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  enableResetButton = () => {
    this.setState({
      canSubmit: true
    });
  }

  disableResetButton = () => {
    this.setState({
      canSubmit: false
    });
  }

  onSubmitReset = (model: Object) => {
    var _this = this;
    UserActions.forgotPassword(model.email, this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Failed to Submit Password Reset'), message: err});
      }else {
        NotificationActions.showNotification(
          {
            message: _this.__('Reset link sent, Please check your email.'),
            position: 'bottomright',
            dismissAfter: 5000,
            onDismiss() {
              window.location='/';
            }
        });
      }
    });
  }

  render() {
    var failed = '';
    if(this.props.failed){
      failed = (
        <div>
          <b className="red-text text-accent-4">{this.__('Login Failed: Please try again.')}</b>
        </div>
      );
    }

    var signup = '';

    if(this.props.showSignup){
      signup = (
        <li>
          <div className="collapsible-header"><i className="material-icons">send</i>{this.__('Sign Up')}</div>
          <div className="collapsible-body">
            <div className="row" style={{paddingTop: '25px'}}>
              <div className="col s12 valign-wrapper">
                    <button onClick={function(){window.location="/signup";}}className="valign waves-effect waves-light btn" style={{margin: 'auto'}} >{this.__('Signup with Email')}</button>
              </div>
            </div>
            <div className="row">
              <div className="col s12">
              </div>
            </div>
          </div>
        </li>
      );
    }

    return (
      <div className="container" style={{maxWidth: '400px'}}>
        <h5 className="grey-text text-darken-4 center">{this.__('Welcome to')} {this.props.name}</h5>
        {failed}
        <div className="row">
          <ul className="collapsible popout" data-collapsible="accordion">
            <li>
              <div className="collapsible-header active"><i className="material-icons">account_circle</i>{this.__('Login')}</div>
              <div className="collapsible-body">
                <form action="/login" id="loginform" method="post">
                  <input type="hidden" name="_csrf" value={this.state._csrf} />
                  <div className="row" style={{margin: '25px'}}>
                    <div className="input-field col s12">
                      <input id="username" name="username" type="text"/>
                      <label htmlFor="username">{this.__('Username')}</label>
                    </div>
                  </div>
                  <div className="row" style={{margin: '25px'}}>
                    <div className="input-field col s12">
                      <input id="password" name="password" type="password"/>
                      <label htmlFor="password">{this.__('Password')}</label>
                    </div>
                  </div>
                </form>
                <div className="row" style={{margin: '25px'}}>
                  <div className="col s12 valign-wrapper">
                    <button className="valign btn waves-effect waves-light right" style={{margin: 'auto'}} form='loginform' name="action" type="submit">{this.__('Login')}
                    </button>
                  </div>
                </div>
              </div>
            </li>
            {signup}
            <li>
              <div className="collapsible-header"><i className="material-icons">report</i>{this.__('Forgot Password')}</div>
              <div className="collapsible-body">
                <Formsy.Form onValidSubmit={this.onSubmitReset} onValid={this.enableResetButton} onInvalid={this.disableResetButton}>
                  <div className="row" style={{margin: '25px'}}>
                    <TextInput name="email" label={this.__('Account Email')} icon="email" className="col s12"
                          validations={{isEmail:true}} validationErrors={{
                           isEmail: this.__('Not a valid email address.')
                       }} length={50}
                       required/>

                  </div>
                  <div className="row">
                    <div className="col s12 valign-wrapper">
                          <button type="submit" className="valign waves-effect waves-light btn" style={{margin: 'auto'}} disabled={!this.state.canSubmit}>{this.__('Request Password Reset')}</button>
                    </div>
                  </div>

                </Formsy.Form>
              </div>
            </li>
          </ul>
        </div>
        <Message />
        <Notification />
      </div>
    );
  }
}