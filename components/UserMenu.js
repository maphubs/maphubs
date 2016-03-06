var React = require('react');
var ReactDOM = require('react-dom');
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
    id: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      id: 'user-menu'
    };
  },

  componentDidMount() {
    UserActions.getUser(function(err){

    });
  },

  componentDidUpdate(prevState){
    if(this.state.loggedIn && !prevState.loggedIn){
      $(ReactDOM.findDOMNode(this.refs.userButton)).dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true, // Does not change width of dropdown to that of the activator
        hover: true, // Activate on hover
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
    var user = (<div></div>);
    if(this.state.loggedIn && this.state.user){

      user = (
        <div>
          <div ref="userButton" className="chip dropdown-button omh-btn" data-activates={this.props.id}>
            <Gravatar email={this.state.user.email} />
            {this.state.user.display_name}

          </div>
          <ul id={this.props.id} className='dropdown-content'>
            <li><a href="/user/settings">{this.__('Settings')}</a></li>
            <li className="divider"></li>
            <li><a onClick={this.logoutClick}>{this.__('Logout')}</a></li>
          </ul>


        </div>
      );
    } else {
      user = (
            <a className="grey-text text-darken-4" href="#" onClick={this.loginClick}>{this.__('Login')}</a>
      );
    }

    return user;
  }
});

module.exports = UserMenu;
