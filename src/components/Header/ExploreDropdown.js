// @flow
import React from 'react'
import { Menu, Dropdown, Icon } from 'antd'

type Props = {
    id: string,
    sidenav: boolean,
    t: Function
  }

export default class ExploreDropdown extends React.PureComponent<Props, void> {
  static defaultProps = {
    id: 'explore-dropdown',
    sidenav: false
  }

  render () {
    const {sidenav, id, t} = this.props
    if (sidenav) {
      return (
        <ul id={id}>
          <li><a href='/explore' className='nav-hover-menu-item'>{t('Explore')}</a></li>
          <li className='divider' />
          <li><a href='/maps' className='nav-hover-menu-item'>{t('Maps')}</a></li>
          <li><a href='/stories' className='nav-hover-menu-item'>{t('Stories')}</a></li>
          <li><a href='/layers' className='nav-hover-menu-item'>{t('Layers')}</a></li>
          <li><a href='/hubs' className='nav-hover-menu-item'>{t('Hubs')}</a></li>
          <li><a href='/groups' className='nav-hover-menu-item'>{t('Groups')}</a></li>
          <li className='divider' />
        </ul>
      )
    } else {
      const menu = (
        <Menu>
          <Menu.Item>
            <a href='/explore' className='nav-hover-menu-item'>{t('All')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/maps' className='nav-hover-menu-item'>{t('Maps')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/stories' className='nav-hover-menu-item'>{t('Stories')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/layers' className='nav-hover-menu-item'>{t('Layers')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/hubs' className='nav-hover-menu-item'>{t('Hubs')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/groups' className='nav-hover-menu-item'>{t('Groups')}</a>
          </Menu.Item>
        </Menu>
      )
      return (
        <li className='nav-link-wrapper' style={{height: '50px', overflow: 'hidden'}}>
          <Dropdown overlay={menu} trigger={['click']}>
            <a className='nav-link-item' href='#'>
              {t('Explore')} <Icon type='down' />
            </a>
          </Dropdown>
        </li>
      )
    }
  }
}
