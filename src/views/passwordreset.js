//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import Password from '../components/forms/Password';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class PasswordReset extends MapHubsComponent {

  props: {
    passreset: string,
    locale: string,
    _csrf: string,
    footerConfig: Object,
    headerConfig: Object
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  onSave = () => {
    window.location = '/login';
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main className="container">
          <div className="row valign-wrapper">
            <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
              <h4 className="center">{this.__('Please Enter a New Password')}</h4>
              <Password passreset={this.props.passreset} csrf={this.state._csrf} onSave={this.onSave}/>
            </div>
          </div>
      </main>
      <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}