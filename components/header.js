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

  propTypes:  {
    activePage: React.PropTypes.string
  },

  componentDidMount() {
    $(".button-collapse").sideNav();
  },

  render() {

    var defaultLinkClasses = "grey-text text-darken-4";
    var activeLinkClasses = "omh-accent-text";

    var layersClasses = defaultLinkClasses,
        groupsClasses = defaultLinkClasses,
        hubsClasses = defaultLinkClasses,
        aboutClasses = defaultLinkClasses,
        storiesClasses = defaultLinkClasses,
        myStoriesClasses = defaultLinkClasses,
        myMapsClasses = defaultLinkClasses;
    if(this.props.activePage){
      var activePage = this.props.activePage;
      if(activePage == 'layers'){
        layersClasses = activeLinkClasses;
      }else if(activePage == 'groups'){
        groupsClasses = activeLinkClasses;
      }else if(activePage == 'hubs'){
        hubsClasses = activeLinkClasses;
      }else if(activePage == 'about'){
        aboutClasses = activeLinkClasses;
      }else if(activePage == 'stories'){
        storiesClasses = activeLinkClasses;
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
        <li>
          <a className={myMapsClasses} href={'/user/' + this.state.user.display_name + '/maps'}>{this.__('My Maps')}</a>
        </li>
      );
      myStories = (
        <li>
          <a className={myStoriesClasses} href={'/user/' + this.state.user.display_name + '/stories'}>{this.__('My Stories')}</a>
        </li>
      );
    }


    return (
      <header>
      <nav className="white" style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)', paddingRight: '0.75rem'}}>
        <div className="nav-wrapper white z-depth-0">
          <a className="brand-logo valign-wrapper" href="/">
            <img className="valign" width="148" height="40" style={{margin: '5px'}} src="/assets/maphubs-logo.png" alt={this.__('MapHubs Logo')}/>
              <small style={{color: '#222222', position: 'absolute', top: '12px', left: '150px', fontSize: '12px'}}>beta</small>

          </a>


          <a className="button-collapse grey-text text-darken-4" data-activates="side-nav-menu" href="#"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li>
              <a className={groupsClasses} href='/groups'>{this.__('Groups')}</a>
            </li>
            <li>
              <a className={layersClasses} href='/layers'>{this.__('Layers')}</a>
            </li>
            <li>
              <a className={storiesClasses} href='/stories'>{this.__('Stories')}</a>
            </li>
            <li>
              <a className={hubsClasses} href='/hubs'>{this.__('Hubs')}</a>
            </li>
            {myMaps}
            {myStories}
            <li>
              <a className={aboutClasses} href='/about'>{this.__('About')}</a>
            </li>
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
              <LocaleChooser />
            </li>
            <li>
              <a className={groupsClasses} href='/groups'>{this.__('Groups')}</a>
            </li>
            <li>
              <a className={layersClasses} href='/layers'>{this.__('Layers')}</a>
            </li>
            <li>
              <a className={storiesClasses} href='/stories'>{this.__('Stories')}</a>
            </li>
            <li>
              <a className={hubsClasses} href='/hubs'>{this.__('Hubs')}</a>
            </li>
            {myMaps}
            {myStories}
            <li>
              <a className={aboutClasses} href='/about'>{this.__('About')}</a>
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
