import React, { useState } from 'react'
import Link from 'next/link'
import { MenuOutlined } from '@ant-design/icons'
import { Layout, Menu, Drawer, Row } from 'antd'
import useT from '../hooks/useT'
import ExploreDropdown from './Header/ExploreDropdown'
import AddDropdown from './Header/AddDropdown'
import HelpDropdown from './Header/HelpDropdown'
import SearchButton from './Header/SearchButton'
import LocaleChooser from './LocaleChooser'
import UserMenu from './Header/UserMenu'

import { LocalizedString } from '../types/LocalizedString'

const { Header } = Layout
type Link = {
  href: string
  label: LocalizedString
}

export type HeaderConfig = {
  logoLinkUrl?: string
  showSearch?: boolean
  showHelp?: boolean
  customSearchLink?: string
  customHelpLink?: string
  showMakeAMap?: boolean
  showExplore?: boolean
  showAdd?: boolean
  customLinks?: Array<Link>
  theme?: {
    backgroundColor?: string
    fontColor?: string
  }
}
type Props = {
  activePage?: string
} & HeaderConfig

const MapHubsHeader = ({
  customHelpLink,
  showHelp,
  activePage,
  customLinks,
  showMakeAMap,
  showSearch,
  customSearchLink,
  showExplore,
  logoLinkUrl,
  theme,
  showAdd
}: Props): JSX.Element => {
  const [visible, setVisible] = useState(false)

  const { t } = useT()

  const renderMenu = (className: string, mode: any): JSX.Element => {
    return (
      <Menu
        mode={mode}
        className={`${className} nav-menu`}
        defaultSelectedKeys={[activePage]}
        style={{
          height: '50px',
          lineHeight: '50px',
          textAlign: mode === 'vertical' ? 'left' : 'right',
          borderBottom: 'none'
        }}
      >
        {showMakeAMap && (
          <Menu.Item
            key='makeamap'
            style={{
              height: '50px'
            }}
          >
            <Link href='/map/new'>
              <a>{t('Make a Map')}</a>
            </Link>
          </Menu.Item>
        )}
        {showExplore && (
          <Menu.Item
            key='explore'
            style={{
              height: '50px'
            }}
          >
            <ExploreDropdown t={t} />
          </Menu.Item>
        )}
        {customLinks.map((link, i) => {
          return (
            <Menu.Item
              key={`nav-custom-link-${i}`}
              style={{
                height: '50px'
              }}
            >
              <a href={link.href}>{t(link.label)}</a>
            </Menu.Item>
          )
        })}
        <Menu.Item
          key='locale'
          style={{
            height: '50px'
          }}
        >
          <LocaleChooser />
        </Menu.Item>
        {showAdd && (
          <Menu.Item
            key='add'
            style={{
              padding: mode === 'vertical' ? '0 20px' : '0 5px',
              height: '50px',
              margin: '0 2px',
              borderBottom: 'none'
            }}
          >
            <Row align='middle'>
              <AddDropdown t={t} sidenav={mode === 'vertical'} />
            </Row>
          </Menu.Item>
        )}
        {showSearch && (
          <Menu.Item
            key='search'
            style={{
              padding: mode === 'vertical' ? '0 20px' : '0 5px',
              height: '50px',
              margin: '0 2px',
              borderBottom: 'none'
            }}
          >
            <Row align='middle'>
              {mode === 'vertical' && (
                <a href={customSearchLink || '/search'}>{t('Search')}</a>
              )}
              {mode !== 'vertical' && (
                <SearchButton searchLink={customSearchLink || '/search'} />
              )}
            </Row>
          </Menu.Item>
        )}
        {showHelp && (
          <Menu.Item
            key='help'
            style={{
              padding: mode === 'vertical' ? '0 20px' : '0 5px',
              height: '50px',
              margin: '0 2px',
              borderBottom: 'none'
            }}
          >
            <Row align='middle'>
              <HelpDropdown customHelpLink={customHelpLink} />
            </Row>
          </Menu.Item>
        )}
        <Menu.Item
          key='user'
          style={{
            height: '50px',
            overflow: 'hidden',
            margin: '0px 10px 0px 5px',
            borderBottom: 'none'
          }}
        >
          <Row align='middle'>
            <UserMenu sidenav={mode === 'vertical'} />
          </Row>
        </Menu.Item>
      </Menu>
    )
  }

  const { fontColor } = theme || {}
  const NavMenu = renderMenu('desktop-menu', 'horizontal')
  const MobileMenu = renderMenu('mobile-menu', 'vertical')
  return (
    <Header
      style={{
        padding: 0,
        height: '50px'
      }}
    >
      <div
        className='logo'
        style={{
          float: 'left'
        }}
      >
        <a className='valign-wrapper' href={logoLinkUrl}>
          <img
            className='valign'
            width={process.env.NEXT_PUBLIC_LOGO_WIDTH}
            height={process.env.NEXT_PUBLIC_LOGO_HEIGHT}
            style={{
              margin: '5px'
            }}
            src={process.env.NEXT_PUBLIC_LOGO}
            alt={process.env.NEXT_PUBLIC_PRODUCT_NAME + ' ' + t('Logo')}
          />
        </a>
      </div>
      <style jsx global>
        {`
          .ant-menu-horizontal > .ant-menu-item {
            vertical-align: top;
          }

          .ant-menu-horizontal > .ant-menu-item:hover {
            border-bottom: none;
          }

          .ant-menu-horizontal > .ant-menu-item-selected {
            border-bottom: none;
          }

          @media (max-width: 1000px) {
            .hamburger-menu {
              display: block !important;
            }
            .desktop-menu {
              display: none;
            }
          }
        `}
      </style>
      {NavMenu}

      <MenuOutlined
        className='hamburger-menu'
        style={{
          fontSize: '24px',
          color: fontColor || 'inherit',
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'none'
        }}
        onClick={() => {
          setVisible(true)
        }}
      />
      <Drawer
        bodyStyle={{
          padding: 0,
          height: '100%'
        }}
        placement='right'
        closable={false}
        onClose={() => {
          setVisible(false)
        }}
        visible={visible}
      >
        <div
          className='nav-menu'
          style={{
            height: '100%'
          }}
        >
          {MobileMenu}
        </div>
      </Drawer>
    </Header>
  )
}
MapHubsHeader.defaultProps = {
  logoLinkUrl: '/',
  showSearch: true,
  showHelp: true,
  showMakeAMap: true,
  showExplore: true,
  showAdd: true,
  customLinks: []
}
export default MapHubsHeader
