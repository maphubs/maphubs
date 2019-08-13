// @flow
import React from 'react'
import { Layout, Menu, Drawer } from 'antd'
import MapHubsComponent from './MapHubsComponent'
import ExploreDropdown from './Header/ExploreDropdown'
import AddDropdown from './Header/AddDropdown'
import HelpButton from './Header/HelpButton'
import SearchButton from './Header/SearchButton'
import LocaleChooser from './LocaleChooser'
import UserMenu from './Header/UserMenu'
import type {LocaleStoreState} from '../stores/LocaleStore'
import MenuIcon from '@material-ui/icons/Menu'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { Header } = Layout

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
  showAdd: boolean,
  customLinks: Array<Link>,
  theme?: {
    backgroundColor?: string,
    fontColor?: string
  }
}

type State = {
  visible: boolean
} & LocaleStoreState

export default class MapHubsHeader extends MapHubsComponent<Props, State> {
  static defaultProps = {
    logoLinkUrl: '/',
    showSearch: true,
    showHelp: true,
    showMakeAMap: true,
    showExplore: true,
    showOSM: false,
    showAdd: true,
    customLinks: []
  }

  showDrawer = () => {
    this.setState({
      visible: true
    })
  }

  onClose = () => {
    this.setState({
      visible: false
    })
  }

  renderMenu = (className: string, mode: string) => {
    const {t} = this
    const {customHelpLink, showHelp, activePage, customLinks, showMakeAMap, showSearch, customSearchLink, showExplore, showAdd} = this.props

    return (
      <Menu
        mode={mode}
        className={`${className} nav-menu`}
        defaultSelectedKeys={[activePage]}
        style={{
          height: '50px',
          lineHeight: '50px',
          textAlign: mode === 'vertical' ? 'left' : 'right'
        }}
      >
        {showMakeAMap &&
          <Menu.Item key='makeamap' style={{
            height: '50px'
          }}>
            <a href='/map/new'>{t('Make a Map')}</a>
          </Menu.Item>
        }
        {showExplore &&
          <Menu.Item key='explore' style={{height: '50px'}}>
            <ExploreDropdown t={t} />
          </Menu.Item>
        }
        {
          customLinks.map((link, i) => {
            return (
              <Menu.Item key={`nav-custom-link-${i}`} style={{height: '50px'}}>
                <a href={link.href}>{this.t(link.label)}</a>
              </Menu.Item>
            )
          })
        }
        <Menu.Item key='locale' style={{padding: '0 20px', height: '50px'}}>
          <LocaleChooser />
        </Menu.Item>
        {showAdd &&
          <Menu.Item key='add' style={{padding: mode === 'vertical' ? '0 20px' : '0 5px', height: '50px'}}>
            <AddDropdown t={t} sidenav={mode === 'vertical'} />
          </Menu.Item>
        }
        {showSearch &&
          <Menu.Item key='search' style={{padding: mode === 'vertical' ? '0 20px' : '0 5px', height: '50px'}}>
            {mode === 'vertical' &&
              <a href={customSearchLink || '/search'}>{t('Search')}</a>
            }
            {mode !== 'vertical' &&
              <SearchButton t={t} searchLink={customSearchLink || '/search'} />
            }
          </Menu.Item>
        }
        {showHelp &&
          <Menu.Item key='help' style={{padding: mode === 'vertical' ? '0 20px' : '0 5px', height: '50px'}}>
            {mode === 'vertical' &&
              <a href={customHelpLink || 'https://help.maphubs.com'}>{t('Help/Support')}</a>
            }
            {mode !== 'vertical' &&
              <HelpButton t={t} helpLink={customHelpLink || 'https://help.maphubs.com'} />
            }
          </Menu.Item>
        }
        <Menu.Item key='user'>
          <UserMenu id='user-menu-header' sidenav={mode === 'vertical'} />
        </Menu.Item>
      </Menu>
    )
  }

  render () {
    const {t} = this
    const { logoLinkUrl, theme } = this.props
    const {backgroundColor, fontColor} = theme || {}

    const NavMenu = this.renderMenu('desktop-menu', 'horizontal', backgroundColor, fontColor)
    const MobileMenu = this.renderMenu('mobile-menu', 'vertical', backgroundColor, fontColor)
    return (
      <Header
        style={{
          padding: 0,
          height: '50px'
        }}>
        <div className='logo' style={{float: 'left'}}>
          <a className='valign-wrapper' href={logoLinkUrl}>
            <img className='valign' width={MAPHUBS_CONFIG.logoWidth} height={MAPHUBS_CONFIG.logoHeight} style={{margin: '5px'}} src={MAPHUBS_CONFIG.logo} alt={MAPHUBS_CONFIG.productName + ' ' + t('Logo')} />
            <small id='beta-text' style={{position: 'absolute', top: '12px', left: MAPHUBS_CONFIG.logoWidth + 5 + 'px', fontSize: '12px'}}>{MAPHUBS_CONFIG.betaText}</small>
          </a>
        </div>
        <style jsx global>{`
          .ant-menu-horizontal > .ant-menu-item {
            vertical-align: top;
          }

          .ant-menu-horizontal > .ant-menu-item:hover {
            border-bottom: none;
          }

          .ant-menu-horizontal > .ant-menu-item-selected {
            border-bottom: none;
          }

          .hamburger-menu{
            display: none !important;
            font-size: 32px !important;
            color: ${fontColor || 'inherit'};
            position: absolute;
            top: 10px;
            right: 10px;
          }


          @media(max-width: 767px){
            .hamburger-menu{
              display: inline-block !important;
            }
            .desktop-menu{
              display: none;
            }
          }
          
        `}</style>
        {NavMenu}
        <MenuIcon className='hamburger-menu' type='primary' onClick={this.showDrawer} />
        <Drawer
          bodyStyle={{padding: 0, height: '100%'}}
          placement='right'
          closable={false}
          onClose={this.onClose}
          visible={this.state.visible}
        >
          <div className='nav-menu' style={{height: '100%'}}>
            {MobileMenu}
          </div>
        </Drawer>
      </Header>
    )
  }
}
