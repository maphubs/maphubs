//@flow
import React from 'react';
var $ = require('jquery');
import Header from '../components/header';
import Gravatar from '../components/user/Gravatar';
import Password from '../components/forms/Password';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Auth0Profile extends MapHubsComponent {

  props: {
    user: Object,
    locale: string,
    _csrf: string,
    headerConfig: Object
  }

  componentDidMount(){
    $('ul.tabs').tabs();
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main className="container">
          <h5>{this.__('User Profile')}</h5>
            
            <div id="profile" className="col s12">
              <p><b>{this.__('User Name')}: </b>{this.props.user.username}</p>
              <p><b>{this.__('Email')}: </b>{this.props.user.email}</p>
              <div>
                <img src={this.props.user.picture} />  
              </div>
            <p>{this.__('More user profile settings coming soon!')}</p>
            </div>
             
      </main>
      </div>
    );
  }
}