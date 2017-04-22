//@flow
import React from 'react';
var $ = require('jquery');
import Header from '../components/header';
import Gravatar from '../components/user/Gravatar';
import Password from '../components/forms/Password';
import MapHubsComponent from '../components/MapHubsComponent';
import LocaleActions from '../actions/LocaleActions';
import Rehydrate from 'reflux-rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class UserSettings extends MapHubsComponent {

  props: {
    user: Object,
    locale: string
  }

  componentDidMount(){
    $('ul.tabs').tabs();
  }

  componentWillMount() {
    Rehydrate.initStore(LocaleStore);
    LocaleActions.rehydrate({locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
    return (
      <div>
        <Header />
        <main className="container">
          <h5>{this.__('User Settings')}</h5>
            <div className="row">
             <div className="col s12">
               <ul className="tabs">
                 <li className="tab col s3"><a className="active" href="#profile">{this.__('Profile')}</a></li>
                 <li className="tab col s3"><a href="#password">{this.__('Password')}</a></li>
               </ul>
             </div>
             <div id="profile" className="col s12">
               <p><b>{this.__('User Name')}: </b>{this.props.user.display_name}</p>
               <p><b>{this.__('Full Name')}: </b>{this.props.user.name}</p>
               <p><b>{this.__('Email')}: </b>{this.props.user.email}</p>
               <div>
                 <Gravatar email={this.props.user.email} size={200} />
                 <p>{this.__('Please update your photo on')} <a href="http://gravatar.com" target="_blank">gravatar.com</a></p>
               </div>
               <p>{this.__('More user profile settings coming soon!')}</p>
             </div>
             <div id="password" style={{margin: 'auto', float: 'none'}} className="col s12 m8 l8">
               <div style={{paddingTop: '25px'}}>
                 <Password userid={this.props.user.id} csrf={this.state._csrf} />
               </div>

             </div>
           </div>
      </main>
      </div>
    );
  }
}