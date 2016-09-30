var React = require('react');
var $ = require('jquery');
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');
var UserMenu = require('../UserMenu');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var LocaleChooser = require('../LocaleChooser');

var HubHav = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    hubid: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      canEdit: false
    };
  },

  componentDidMount() {
    $(this.refs.hubNav).sideNav({edge: 'right'});
  },

  render(){
    var baseHost = urlUtil.getHostFromHub(config.host);
    var omhBaseUrl = urlUtil.getBaseUrl(baseHost, config.port);

    var hubBaseUrl;
    if(config.mapHubsPro){
      hubBaseUrl = omhBaseUrl + '/hub/' + this.props.hubid + '/';
    }else{
      hubBaseUrl = urlUtil.getHubUrl(this.props.hubid, baseHost, config.port) + '/';
    }

    var manageButton = '';
    if(this.props.canEdit){
      manageButton = (
        <li className="nav-link-wrapper"><a href="admin">{this.__('Manage Hub')}</a></li>
      );
    }
    return (
        <nav className="white" style={{height: '0px'}}>
          <div className="nav-wrapper">
            <a href="#" ref="hubNav" data-activates="nav" className="button-collapse white-text text-shadow"
              style={{display: 'block', position: 'absolute', top: '5px', right: '5px'}}>
              <i className="material-icons">menu</i>
            </a>
            <ul className="side-nav" id="nav">
              <UserMenu id="user-menu-sidenav"/>
              <li className="nav-link-wrapper"><a href={hubBaseUrl}>{this.__('Home')}</a></li>
              <li className="nav-link-wrapper"><a href={hubBaseUrl + 'map'}>{this.__('Map')}</a></li>
              <li className="nav-link-wrapper"><a href={hubBaseUrl + 'stories'}>{this.__('Stories')}</a></li>
              <li className="nav-link-wrapper"><a href={hubBaseUrl + 'resources'}>{this.__('Resources')}</a></li>
              <LocaleChooser />
              <hr />
              <li className="nav-link-wrapper"><a href={omhBaseUrl}>{this.__('Back to ') + config.productName}</a></li>
              {manageButton}
            </ul>
          </div>
        </nav>
    );
  }
});

module.exports = HubHav;
//  <li><a href={hubBaseUrl + 'about'}>{this.__('About')}</a></li>
//  <li><a href={hubBaseUrl + 'contact'}>{this.__('Contact Us')}</a></li>
