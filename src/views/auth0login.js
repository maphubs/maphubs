//@flow
import React from 'react';
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
  allowSignUp: boolean
}

type DefaultProps = {
  initialScreen: string,
  allowSignUp: boolean
}

type State = LocaleStoreState

export default class Login extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps = {
    initialScreen: 'login',
    allowSignUp: true
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
      language: this.state.locale,
      mustAcceptTerms: true,
      theme: {
        logo: 'https://d28qp8lgme8ph4.cloudfront.net/assets/maphubs-logo.png',
        primaryColor: MAPHUBS_CONFIG.primaryColor
      },
      languageDictionary: {
        title: `${this.__('MapHubs Login')}`
      }
    });

    lock.show();

  }

  render() {
    return (
      <div>
        <div className="page-footer no-margin no-padding valign-wrapper" style={{height: '10%'}}>
            <div className="row center valign" style={{fontSize: '16px', paddingLeft: '10%', paddingRight: '10%'}}>
              {this.__('We recently upgraded our login system. If you are unable to access your account please try to')} <a href="forgotpassword">{this.__('reset your password')}</a> {this.__('or contact us at')} <a href="mailto:support@maphubs.com">support@maphubs.com</a> 
            </div>
         
          </div>
         <div className="row no-margin" style={{height: 'calc(90% - 20px)'}}>
          <div id="login-container" className="z-depth-4" style={{width: '300px', borderRadius: '5px', margin: '10px auto', padding: '0px'}}></div>         
         </div>
          
         
      </div>
     
    );
  }
}