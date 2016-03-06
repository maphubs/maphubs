var React = require('react');
var $ = require('jquery');
var UserMenu = require('./UserMenu');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var UserStore = require('../stores/UserStore');
var Notification = require('../components/Notification');
var Message = require('../components/message');
var Confirmation = require('../components/confirmation');

//var debug = require('../services/debug')('header');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var LocaleChooser = require('./LocaleChooser');

var Header = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  componentDidMount() {
    $(".button-collapse").sideNav();
  },

  render() {
    var myMaps = '';
    var myStories = '';
    if(this.state.loggedIn){
      myMaps = (
        <li>
          <a className="grey-text text-darken-4" href={'/user/' + this.state.user.display_name + '/maps'}>{this.__('My Maps')}</a>
        </li>
      );
      myStories = (
        <li>
          <a className="grey-text text-darken-4" href={'/user/' + this.state.user.display_name + '/stories'}>{this.__('My Stories')}</a>
        </li>
      );
    }


    return (
      <header>
      <nav className="white" style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)', paddingRight: '0.75rem'}}>
        <div className="nav-wrapper white z-depth-0">
          <a className="brand-logo valign-wrapper" href="/">
            <img className="valign" width="148" height="40" style={{margin: '5px'}} src="/assets/maphubs-logo.png" alt={this.__('MapHubs Logo')}/>
          </a>


          <a className="button-collapse grey-text text-darken-4" data-activates="side-nav-menu" href="#"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li>
              <a className="grey-text text-darken-4" href='/groups'>{this.__('Groups')}</a>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/layers'>{this.__('Layers')}</a>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/stories'>{this.__('Stories')}</a>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/hubs'>{this.__('Hubs')}</a>
            </li>
            {myMaps}
            {myStories}
            <li>
              <LocaleChooser />
            </li>
            <li style={{paddingLeft: '10px'}}>
              <UserMenu id="user-menu-header"/>
            </li>
          </ul>
          <ul className="side-nav" id="side-nav-menu">
            <li>
              <UserMenu id="user-menu-sidenav"/>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/groups'>{this.__('Groups')}</a>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/layers'>{this.__('Layers')}</a>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/stories'>{this.__('Stories')}</a>
            </li>
            <li>
              <a className="grey-text text-darken-4" href='/hubs'>{this.__('Hubs')}</a>
            </li>
            {myMaps}
            {myStories}

          </ul>
        </div>
      </nav>
      <Notification />
      <Message />
      <Confirmation />
      </header>
    );
  }
});

module.exports = Header;
