//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class EmailConfirmation extends MapHubsComponent {

  props: {
    valid: boolean,
    locale: string,
    _csrf: string,
    footerConfig: Object
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    var content = '';
    if(this.props.valid){
      content = (
        <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
          <h4 className="center">{this.__('Email Confirmed')}</h4>
          <p>{this.__('Thank you for confirming your account!')}</p>
        </div>
      );
    }else{
      content = (
        <div className="col s12 m8 l8 valign" style={{margin: 'auto'}}>
          <h4 className="center">{this.__('Unable to Confirm Email')}</h4>
          <p>{this.__('This email may have already been confirmed. If you are unable to access your account please contact us at ')}<a href="#" onClick={function(){HS.beacon.open();}}>{MAPHUBS_CONFIG.contactEmail}</a></p>
        </div>
      );
    }

    return (
      <div>
        <Header />
        <main className="container">
          <div className="row valign-wrapper">
            {content}
          </div>
      </main>
      <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}