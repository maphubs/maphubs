var React = require('react');

var $ = require('jquery');
var Header = require('../components/header');
var Gravatar = require('../components/user/Gravatar');
var Password = require('../components/forms/Password');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserSettings = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    user: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  componentDidMount(){
    $('ul.tabs').tabs();
  },

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
                 <Password userid={this.props.user.id} />
               </div>

             </div>
           </div>
      </main>
      </div>
    );
  }
});

module.exports = UserSettings;
