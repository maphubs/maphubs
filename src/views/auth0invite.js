//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  locale: string,
  _csrf: string,
  email: string,
  footerConfig: Object,
  headerConfig: Object
}

export default class Auth0InviteConfirmation extends MapHubsComponent<void, Props, void> {

  props: Props

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main className="container">
          <div className="row valign-wrapper">
             <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
            <h4 className="center">{this.__('Email Confirmed')}</h4>
            <p>{this.__('Thank you for confirming your account!')}</p>           
          </div>    
          </div>
          <div className="row">
            <div className="col s12 m6">
              <a className="btn" href="/login">{this.__('Login')}</a>
            </div>
            <div className="col s12 m6">
              <a className="btn" href="/signup">{this.__('Signup')}</a>
            </div>
          </div>
      </main>
      <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}