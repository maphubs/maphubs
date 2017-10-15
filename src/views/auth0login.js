//@flow
import React from 'react';
import Auth0Lock from 'auth0-lock';
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleStore from '../stores/LocaleStore';
import Reflux from '../components/Rehydrate';
import type {LocaleStoreState} from '../stores/LocaleStore';


type Props = {
  locale: string,
  AUTH0_CLIENT_ID: string,
  AUTH0_DOMAIN: string,
  AUTH0_CALLBACK_URL: string,
  initialScreen: string,
  allowSignUp: boolean,
  allowLogin: boolean,
  flashMessage: {type: ['success' | 'error'], text: string}
}

type State = LocaleStoreState

export default class Login extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps = {
    initialScreen: 'login',
    allowSignUp: true,
    allowLogin: true
  }

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale});
  }

  componentDidMount(){

    
    var lock = new Auth0Lock(this.props.AUTH0_CLIENT_ID, this.props.AUTH0_DOMAIN,{ 
      container: 'login-container',
      initialScreen: this.props.initialScreen,
      auth: {
        redirectUrl: this.props.AUTH0_CALLBACK_URL,
        responseType: 'code',
        params: {
          scope: 'openid name email picture'
        }
      },
      allowSignUp: this.props.allowSignUp,
      allowLogin: this.props.allowLogin,
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

    lock.show({flashMessage: this.props.flashMessage});
    this.lock = lock;
  }

  componentWillReceiveProps(nextProps: Props){
    if(nextProps.initialScreen !== this.props.initialScreen){
      if(nextProps.initialScreen === 'signUp'){
        this.lock.show({
          initialScreen: nextProps.initialScreen,
          flashMessage: nextProps.flashMessage
        });
      }else{
        this.lock.show({
          initialScreen: nextProps.initialScreen,
          flashMessage: nextProps.flashMessage
        });
      }
     
    }else if(nextProps.flashMessage !== this.props.flashMessage){
      this.lock.show({
        flashMessage: nextProps.flashMessage
      });
    }else if(nextProps.allowSignUp !== this.props.allowSignUp){
      this.lock.show({
        allowSignUp: nextProps.flashMessage
      });
    }
  }

  render() {
    return (
      <div>
        <div className="row no-padding valign-wrapper z-depth-1">
            <div className="center valign" style={{fontSize: '16px', paddingLeft: '10%', paddingRight: '10%'}}>
              {this.__('We recently upgraded our login system. If you are unable to access your account please try to')} <a href="forgotpassword">{this.__('reset your password')}</a> {this.__('or contact us at')} <a href="mailto:support@maphubs.com">support@maphubs.com</a> 
            </div>
         
          </div>
         <div className="row no-margin" style={{height: 'calc(90% - 20px)'}}>
          <div id="login-container"></div>         
         </div>
          
         
      </div>
     
    );
  }
}