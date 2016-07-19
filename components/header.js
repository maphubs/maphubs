var React = require('react');
var $ = require('jquery');
var UserMenu = require('./UserMenu');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var UserStore = require('../stores/UserStore');
var Notification = require('../components/Notification');
var Message = require('../components/message');
var MessageActions = require('../actions/MessageActions');
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

  propTypes:  {
    activePage: React.PropTypes.string
  },

  componentDidMount() {
    $(".button-collapse").sideNav();
    if(this.detectIE()){
      MessageActions.showMessage({
        title: this.__('Unsupported Browser'),
        message: this.__('MapHubs is unable to support Internet Explorer. Please use Firefox or Chrome with MapHubs.')
      });
    }
  },

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
detectIE() {
  if(window === undefined){return false;}

  //only show the use this warning once per day
  if(this.getCookie('iecheck')){
    return false;
  }else{
    this.setCookie('iecheck', true, 1);
  }

  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // IE 12 / Spartan
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge (IE 12+)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

/*
  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }
*/
  // other browser
  return false;
},

setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
},

getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
},

  render() {

    var defaultLinkClasses = "";
    var activeLinkClasses = "active";

    var exploreClasses = defaultLinkClasses,
        servicesClasses = defaultLinkClasses,
        aboutClasses = defaultLinkClasses,
        myStoriesClasses = defaultLinkClasses,
        myMapsClasses = defaultLinkClasses;
    if(this.props.activePage){
      var activePage = this.props.activePage;
      if(activePage == 'explore'){
        exploreClasses = activeLinkClasses;
      }else if(activePage == 'services'){
        servicesClasses = activeLinkClasses;
      }else if(activePage == 'about'){
        aboutClasses = activeLinkClasses;
      }else if(activePage == 'mystories'){
        myStoriesClasses = activeLinkClasses;
      }else if(activePage == 'mymaps'){
        myMapsClasses = activeLinkClasses;
      }
    }

    var myMaps = '';
    var myStories = '';
    if(this.state.loggedIn){
      myMaps = (
        <li className="nav-link-wrapper">
          <a className={myMapsClasses} href={'/user/' + this.state.user.display_name + '/maps'}>{this.__('My Maps')}</a>
        </li>
      );
      myStories = (
        <li className="nav-link-wrapper">
          <a className={myStoriesClasses} href={'/user/' + this.state.user.display_name + '/stories'}>{this.__('My Stories')}</a>
        </li>
      );
    }


    return (
      <header>
      <nav className="white" style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)'}}>
        <div className="nav-wrapper white z-depth-0">
          <a className="brand-logo valign-wrapper" href="/">
            <img className="valign" width="148" height="40" style={{margin: '5px'}} src="/assets/maphubs-logo.png" alt={this.__('MapHubs Logo')}/>
              <small style={{color: '#222222', position: 'absolute', top: '12px', left: '150px', fontSize: '12px'}}>beta</small>

          </a>


          <a className="button-collapse grey-text text-darken-4" data-activates="side-nav-menu" href="#"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li className="nav-link-wrapper">
              <a className={exploreClasses} href='/explore'>{this.__('Explore')}</a>
            </li>
            <li className="nav-link-wrapper">
              <a className={servicesClasses} href='/services'>{this.__('Services')}</a>
            </li>


            {myMaps}
            {myStories}
            <li className="nav-link-wrapper">
              <a className={aboutClasses} href='/about'>{this.__('About')}</a>
            </li>
            <li className="nav-link-wrapper">
              <a href='http://help.maphubs.com'>{this.__('Help')}</a>
            </li>

            <li style={{marginRight: '10px'}}>
              <LocaleChooser />
            </li>
            <UserMenu id="user-menu-header"/>
            <li className="nav-link-wrapper">
              <a href='/search'>
                <i className="material-icons">search</i>
              </a>
            </li>
          </ul>
          <ul className="side-nav" id="side-nav-menu">
              <UserMenu id="user-menu-sidenav"/>
            <li className="nav-link-wrapper">
              <LocaleChooser />
            </li>
            <li className="nav-link-wrapper">
              <a className={exploreClasses} href='/explore'>{this.__('Explore')}</a>
            </li>
            <li className="nav-link-wrapper">
              <a className={servicesClasses} href='/services'>{this.__('Services')}</a>
            </li>

            {myMaps}
            {myStories}
            <li className="nav-link-wrapper">
              <a className={aboutClasses} href='/about'>{this.__('About')}</a>
            </li>
            <li className="nav-link-wrapper">
              <a href='http://help.maphubs.com'>{this.__('Help')}</a>
            </li>
            <li className="nav-link-wrapper">
              <a href='/search'>
                <i className="material-icons">search</i>{this.__('Search')}
              </a>
            </li>
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
