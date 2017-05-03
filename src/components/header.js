//@flow
import React from 'react';
var $ = require('jquery');
import UserMenu from './UserMenu';
import MapHubsComponent from './MapHubsComponent';
import UserStore from '../stores/UserStore';
import Notification from '../components/Notification';
import Message from '../components/message';
import MessageActions from '../actions/MessageActions';
import Confirmation from '../components/confirmation';
//var debug = require('../services/debug')('header');
import LocaleChooser from './LocaleChooser';

export default class Header extends MapHubsComponent {

  props: {
    activePage: string,
    logoLinkUrl: string,
  }

  static defaultProps = {
    logoLinkUrl: '/'
  }

  constructor(props: Object){
		super(props);
		this.stores.push(UserStore);
	}

  componentDidMount() {
    $(this.refs.sideNav).sideNav();
     $('.nav-tooltip').tooltip();
    $(this.refs.explore).dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: true, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });

    if(this.detectIE()){
      MessageActions.showMessage({
        title: this.__('Unsupported Browser'),
        message: this.__('Unable to support Internet Explorer. Please use Firefox or Chrome.')
      });
    }
  }

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
detectIE = () => {
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
}

setCookie = (cname: string, cvalue: any, exdays: number) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

getCookie = (cname: string) => {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
}

  render() {

    var defaultLinkClasses = "nav-link-item";
    var activeLinkClasses = "nav-link-item active";

    var exploreClasses = 'explore-dropdown-button nav-dropdown-button',
        mapClasses = defaultLinkClasses;
    if(this.props.activePage){
      var activePage = this.props.activePage;
      if(activePage === 'map'){
        mapClasses = activeLinkClasses;
      }else if(activePage === 'explore'){
        exploreClasses = activeLinkClasses + ' explore-dropdown-button nav-dropdown-button';
      }
    }

    var osm = '';
    if(!MAPHUBS_CONFIG.mapHubsPro){
      osm = (
        <li className="nav-link-wrapper nav-tooltip"
          data-position="bottom" data-delay="50" data-tooltip={this.__('Help us map in OpenStreetMap')}
          >
          <a className={mapClasses} href='https://osm.mapforenvironment.org'>{this.__('OpenStreetMap')}</a>
        </li>
      );

    }

    return (
      <header>

      <nav style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)'}}>
        <div className="nav-wrapper z-depth-0">
          <a className="brand-logo valign-wrapper" href={this.props.logoLinkUrl}>
            <img className="valign" width={MAPHUBS_CONFIG.logoWidth} height={MAPHUBS_CONFIG.logoHeight} style={{margin: '5px'}} src={MAPHUBS_CONFIG.logo} alt={MAPHUBS_CONFIG.productName + ' ' + this.__('Logo')}/>
              <small id="beta-text" style={{position: 'absolute', top: '12px', left: MAPHUBS_CONFIG.logoWidth + 5 + 'px', fontSize: '12px'}}>{MAPHUBS_CONFIG.betaText}</small>

          </a>

          <a ref="sideNav" className="button-collapse grey-text text-darken-4" data-activates="side-nav-menu" href="#"><i className="material-icons">menu</i></a>
          <ul className="right hide-on-med-and-down">
            <li className="nav-link-wrapper">
              <a className={mapClasses} href='/map/new'>{this.__('Make a Map')}</a>
            </li>
            <li className="nav-dropdown-link-wrapper nav-link-wrapper">
              <a className={exploreClasses} ref="explore" href="#!" data-activates="explore-dropdown" style={{paddingRight: 0}}>{this.__('Explore')}<i className="material-icons right" style={{marginLeft: 0}}>arrow_drop_down</i></a>
                <ul id="explore-dropdown" className="dropdown-content">
                  <li><a href="/explore" className="nav-hover-menu-item">{this.__('Explore')}</a></li>
                  <li className="divider"></li>
                  <li><a href="/maps" className="nav-hover-menu-item">{this.__('Maps')}</a></li>
                  <li><a href="/stories" className="nav-hover-menu-item">{this.__('Stories')}</a></li>
                  <li><a href="/layers" className="nav-hover-menu-item">{this.__('Layers')}</a></li>
                  <li><a href="/hubs" className="nav-hover-menu-item">{this.__('Hubs')}</a></li>
                  <li><a href="/groups" className="nav-hover-menu-item">{this.__('Groups')}</a></li>
                </ul>
            </li>


            {osm}

            <LocaleChooser/>

            
            <li className="nav-link-wrapper nav-tooltip"
              data-position="bottom" data-delay="50" data-tooltip={this.__('Search')}>
              <a  className="nav-link-item" href='/search'>
                <i className="material-icons">search</i>
              </a>
            </li>
            <UserMenu id="user-menu-header"/>
          </ul>
          <ul className="side-nav" id="side-nav-menu">
              <UserMenu id="user-menu-sidenav" sideNav/>

              

            <li className="nav-link-wrapper">
              <a className={mapClasses} href='/map/new'>{this.__('Make a Map')}</a>
            </li>
            <li className="nav-link-wrapper">
              <a className={exploreClasses} href='/explore'>{this.__('Explore')}</a>
            </li>
            {osm}

            <li className="nav-link-wrapper">
              <a href='/search' className="nav-link-item">
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
}
//<LocaleChooser id="locale-sidenav"/> 