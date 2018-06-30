// @flow
import React from 'react'

import UserMenu from './Header/UserMenu'
import MapHubsComponent from './MapHubsComponent'
import UserStore from '../stores/UserStore'
import Notification from '../components/Notification'
import Message from '../components/message'
import MessageActions from '../actions/MessageActions'
import Confirmation from '../components/confirmation'
// var debug = require('../services/debug')('header');
import LocaleChooser from './LocaleChooser'
import _isequal from 'lodash.isequal'
import type {LocaleStoreState} from '../stores/LocaleStore'
import HelpButton from './Header/HelpButton'
import SearchButton from './Header/SearchButton'
import ExploreDropdown from './Header/ExploreDropdown'

type Link = {
  href: string,
  label: LocalizedString
}

type Props = {
  activePage: string,
  logoLinkUrl: string,
  showSearch: boolean,
  showHelp: boolean,
  customSearchLink?: string,
  customHelpLink?: string,
  showMakeAMap: boolean,
  showExplore: boolean,
  showOSM: boolean,
  customLinks: Array<Link>
}

type State = LocaleStoreState;

export default class Header extends MapHubsComponent<Props, State> {
  props: Props
  sidenav: any

  static defaultProps = {
    logoLinkUrl: '/',
    showSearch: true,
    showHelp: true,
    showMakeAMap: true,
    showExplore: true,
    showOSM: false,
    customLinks: []
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
  }

  componentDidMount () {
    M.Sidenav.init(this.sidenav, {})

    if (this.detectIE()) {
      MessageActions.showMessage({
        title: this.__('Unsupported Browser'),
        message: this.__('Unable to support Internet Explorer. Please use Firefox or Chrome.')
      })
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (this.state.locale !== nextState.locale) {
      return true
    }
    return false
  }

  /**
   * detect IE
   * returns version of IE or false, if browser is not Internet Explorer
   */
  detectIE = () => {
    if (window === undefined) { return false }

    // only show the use this warning once per day
    if (this.getCookie('iecheck')) {
      return false
    } else {
      this.setCookie('iecheck', true, 1)
    }

    const ua = window.navigator.userAgent

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // IE 12 / Spartan
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge (IE 12+)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    const msie = ua.indexOf('MSIE ')
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
    }

    const trident = ua.indexOf('Trident/')
    if (trident > 0) {
      // IE 11 => return version number
      const rv = ua.indexOf('rv:')
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    }

    /*
    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
  */
    // other browser
    return false
  }

  setCookie = (cname: string, cvalue: any, exdays: number) => {
    const d = new Date()
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    const expires = 'expires=' + d.toUTCString()
    document.cookie = cname + '=' + cvalue + '; ' + expires
  }

  getCookie = (cname: string) => {
    const name = cname + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1)
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
    }
    return ''
  }

  render () {
    const defaultLinkClasses = 'nav-link-item'
    const activeLinkClasses = 'nav-link-item active'

    const {customHelpLink, showHelp, activePage, logoLinkUrl, customLinks, showMakeAMap, showSearch, customSearchLink, showExplore} = this.props

    let mapClasses = defaultLinkClasses
    if (activePage && activePage === 'map') {
      mapClasses = activeLinkClasses
    }

    return (
      <header>

        <nav style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)'}}>
          <div className='nav-wrapper z-depth-0'>
            <a className='brand-logo valign-wrapper' href={logoLinkUrl}>
              <img className='valign' width={MAPHUBS_CONFIG.logoWidth} height={MAPHUBS_CONFIG.logoHeight} style={{margin: '5px'}} src={MAPHUBS_CONFIG.logo} alt={MAPHUBS_CONFIG.productName + ' ' + this.__('Logo')} />
              <small id='beta-text' style={{position: 'absolute', top: '12px', left: MAPHUBS_CONFIG.logoWidth + 5 + 'px', fontSize: '12px'}}>{MAPHUBS_CONFIG.betaText}</small>
            </a>

            <a className='button-collapse omh-accent-text sidenav-trigger' data-target='side-nav-menu' href='#'><i className='material-icons'>menu</i></a>
            <ul className='right hide-on-med-and-down'>
              {showMakeAMap &&
                <li className='nav-link-wrapper'>
                  <a className={mapClasses} href='/map/new'>{this.__('Make a Map')}</a>
                </li>
              }
              {showExplore &&
                <ExploreDropdown />
              }
              {
                this.props.customLinks.map((link, i) => {
                  return (
                    <li key={`nav-custom-link-${i}`} className='nav-link-wrapper'>
                      <a className={mapClasses} href={link.href}>{this._o_(link.label)}</a>
                    </li>
                  )
                })
              }
              <LocaleChooser />
              {showSearch &&
                <SearchButton t={this.__} searchLink={customSearchLink || '/search'} />
              }
              {showHelp &&
                <HelpButton t={this.__} helpLink={customHelpLink || 'http://help.maphubs.com'} />
              }
              <UserMenu id='user-menu-header' />
            </ul>
            <ul ref={(el) => { this.sidenav = el }} className='sidenav' id='side-nav-menu'>       
              {showExplore &&
                <ExploreDropdown sidenav id='explore-sidnav' />
              }
              {showMakeAMap &&
                <li className='nav-link-wrapper'>
                  <a className={mapClasses} href='/map/new'>{this.__('Make a Map')}</a>
                </li>
              }
              {
                customLinks.map((link, i) => (
                  <li key={`nav-custom-link-${i}`} className='nav-link-wrapper'>
                    <a className={mapClasses} href={link.href}>{this._o_(link.label)}</a>
                  </li>
                ))
              }
              {showSearch &&
                <li className='nav-link-wrapper'>
                  <a className={mapClasses} href={customSearchLink || '/search'}>{this.__('Search')}</a>
                </li>
              }
              {showHelp &&
                <li className='nav-link-wrapper'>
                  <a className={mapClasses} href={customHelpLink || 'http://help.maphubs.com'}>{this.__('Help/Support')}</a>
                </li>
              }
              <UserMenu id='user-menu-sidenav' sidenav />
            </ul>
          </div>
        </nav>
        <Notification />
        <Message />
        <Confirmation />
      </header>
    )
  }
}
