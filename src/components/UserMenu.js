import React from 'react';
import PropTypes from 'prop-types';
var $ = require('jquery');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var UserStore = require('../stores/UserStore');
var UserActions = require('../actions/UserActions');
var Gravatar = require('./user/Gravatar');

var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var UserMenu = React.createClass({

  mixins:[StateMixin.connect(UserStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    id: PropTypes.string,
    sideNav: PropTypes.bool
  },

  getDefaultProps() {
    return {
      id: 'user-menu',
      sideNav: false
    };
  },

  componentDidMount() {
    UserActions.getUser(function(){});
  },

  componentDidUpdate(prevState){
    if(this.state.loggedIn && !prevState.loggedIn){
      $(this.refs.userButton).dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
      });
    }
  },

  loginClick(){
    window.location = "/login?returnTo=" + window.location;
  },

  logoutClick(){
    window.location = "/logout?returnTo=" + window.location;
  },

  render() {
    var user = (<div style={{width: '194px'}}></div>);
    if(!this.state.loaded){
      return user;
    }
    if(this.state.loggedIn && this.state.user){

      var adminInvites = '';
      if(this.state.user.admin){
        adminInvites = (
          <li className="usermenu-wrapper"><a href="/admin/invite">{this.__('Invite Users')}</a></li>
        );
      }

      user = (
        <li>
          <div ref="userButton" className="chip user-dropdown-button omh-btn" style={{marginRight:'5px', marginLeft: '5px', backgroundColor: '#FFF'}} data-activates={this.props.id}>
            <Gravatar email={this.state.user.email} />
            {this.state.user.display_name}
            <i className="material-icons right" style={{marginLeft: 0, color: '#212121', height: '30px', lineHeight: '30px', width: '15px'}}>arrow_drop_down</i>
          </div>
          <ul id={this.props.id} className='dropdown-content' style={{top: '100px'}}>
            <li className="usermenu-wrapper"><a href={'/user/' + this.state.user.display_name + '/maps'}>{this.__('My Maps')}</a></li>
            <li className="divider"></li>
            <li className="usermenu-wrapper"><a href={'/user/' + this.state.user.display_name + '/stories'}>{this.__('My Stories')}</a></li>
            <li className="divider"></li>
            <li className="usermenu-wrapper"><a href={'/user/' + this.state.user.display_name + '/groups'}>{this.__('My Groups')}</a></li>
            <li className="divider"></li>
            <li className="usermenu-wrapper"><a href={'/user/' + this.state.user.display_name + '/hubs'}>{this.__('My Hubs')}</a></li>
            <li className="divider"></li>
            <li className="usermenu-wrapper"><a href="/user/settings">{this.__('Settings')}</a></li>
            {adminInvites}
            <li className="divider"></li>
            <li className="usermenu-wrapper"><a href={'/logout'}>{this.__('Logout')}</a></li>
          </ul>


        </li>
      );
    } else {

      var signup = '';
      var style = {};
      if(!this.props.sideNav){
        style={marginLeft: '1px', marginRight: '5px'};
      }
      if(!MAPHUBS_CONFIG.mapHubsPro){
        signup = (
          <a className="btn" style={style} href="/signup">{this.__('Sign Up')}</a>
        );
      }

      user = (
        <span>
          <li className="nav-link-wrapper">
              <a className="nav-link-item" style={{float: !this.props.sideNav ? 'left' : 'inherit'}} href="#" onClick={this.loginClick}>{this.__('Login')}</a>
          </li>
          {signup}
        </span>
      );
    }

    return user;
  }
});

module.exports = UserMenu;
