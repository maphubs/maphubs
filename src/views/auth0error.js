//@flow
import React from 'react';
import MapHubsComponent from '../components/MapHubsComponent';
import Header from '../components/header';
import Footer from '../components/footer';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

type Props = {
  locale: string,
  _csrf: string,
  requireInvite?: boolean,
  adminEmail: string,
  footerConfig: Object,
  headerConfig: Object
}

export default class Error extends MapHubsComponent<Props, void> {

  props: Props

  constructor(props: Props) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {

    let message = '';

    if(this.props.requireInvite){
      message = (
        <p className="flow-text center-align">{this.__('Accessing this site requires an invitation. Please contact us at ')}
          <a href={`mailto:${this.props.adminEmail}`}>{this.props.adminEmail}</a>
        </p>
      );
    }else{
      message = (
        <p className="flow-text center-align">{this.__('We are having an issue finding your account. Please contact us at ')}
          <a href={`mailto:${this.props.adminEmail}`}>{this.props.adminEmail}</a>
        </p>
      );
    }

    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main>
          <div className="container s12">
            <h3 className="center-align">{this.__('Unable to Access Account')}</h3>
            {message}
          </div>
        </main>
        <Footer {...this.props.footerConfig}/>
      </div>
    );
  }
}