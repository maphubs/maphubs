//@flow
import React from 'react';
import MapHubsComponent from '../components/MapHubsComponent';
import Header from '../components/header';
import Footer from '../components/footer';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Error extends MapHubsComponent {

  props: {
    locale: string,
    _csrf: string,
    footerConfig: Object,
    headerConfig: Object
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main>
          <div className="container s12">
            <h3 className="center-align">{this.__('Unable to Access Account')}</h3>
            <p className="flow-text center-align">{this.__('We are having an issue finding your account. Please contact us at support@maphubs.com for assistance.')}</p>
          </div>
        </main>
        <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}