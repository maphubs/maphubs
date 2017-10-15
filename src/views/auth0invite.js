//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleStore from '../stores/LocaleStore';
import Reflux from '../components/Rehydrate';
import type {LocaleStoreState} from '../stores/LocaleStore';
import Auth0Lock from 'auth0-lock';

type Props = {
  AUTH0_CLIENT_ID: string,
  AUTH0_DOMAIN: string,
  AUTH0_CALLBACK_URL: string,
  locale: string,
  _csrf: string,
  email: string,
  footerConfig: Object,
  headerConfig: Object
}
type State = {
  showLogin: boolean,
  showSignup: boolean
} & LocaleStoreState

export default class Auth0InviteConfirmation extends MapHubsComponent<Props, State> {

  props: Props

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  showLogin = () => {
    this.showAuth(false);
  }

  showSignup = () => {
    this.showAuth(true);
  }

  showAuth = (signup: boolean) => {

    let initialScreen, allowSignUp, allowLogin;

    if(signup){
      initialScreen = 'signUp';
      allowSignUp = true;
      allowLogin = false;
    }else{
      initialScreen = 'login';
      allowSignUp = false;
      allowLogin = true;
    }

    var lock = new Auth0Lock(this.props.AUTH0_CLIENT_ID, this.props.AUTH0_DOMAIN,{ 
      container: 'login-container',
      initialScreen,
      auth: {
        redirectUrl: this.props.AUTH0_CALLBACK_URL,
        responseType: 'code',
        params: {
          scope: 'openid name email picture'
        }
      },
      prefill: {
        email: this.props.email
      },
      allowSignUp,
      allowLogin,
      allowForgotPassword: true,
      allowShowPassword: false, //FIXME: causes css conflicts with materialize-css
      language: this.state.locale,
      mustAcceptTerms: false, //when enable you have click the checkbox first before the social buttons activate, this is very confusing
      theme: {
        logo: 'https://cdn.maphubs.com/assets/maphubs-logo.png',
        primaryColor: MAPHUBS_CONFIG.primaryColor
      },
      languageDictionary: {
        title: `${this.__('MapHubs Account')}`,
        signUpTerms: `${this.__('I have read and agree to the ')} <a href="/terms" target="_blank">${this.__('terms')}</a> ${this.__('and')} <a href="/privacy" target="_blank">${this.__('privacy policy')}.</a>`
      }
    });

   

    lock.on('authorization_error',(error) => {
      lock.show({
        flashMessage: {
          type: 'error',
          text: error.error_description
        }
      });
    });

    lock.show({
      flashMessage: {
        type: 'success', 
        text: `Access Approved for ${this.props.email}`
      }
    });
    this.lock = lock;
  }


  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main className="container">
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
              <h4 className="center">{this.__('Email Confirmed')}</h4>         
            </div>    
          </div>
          <div className="row center" style={{margin: 'auto'}}>
            <div className="col s12 m6">
            <p>{this.__(`I already have a MapHubs Account for ${this.props.email}`)}</p> 
              <a className="btn" onClick={this.showLogin}>{this.__('Login')}</a>
            </div>
            <div className="col s12 m6">
            <p>{this.__(`Create a new account for my email address ${this.props.email}`)}</p> 
              <a className="btn"  onClick={this.showSignup}>{this.__('Signup')}</a>
            </div>
          </div>
          <div className="row no-margin" style={{paddingTop: '20px', minHeight: '200px'}}>
           <div id="login-container"></div>         
          </div>
      </main>
      <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}