// @flow
import React from 'react'
import { Menu, Dropdown, Icon } from 'antd'

type Props = {
  t: Function
}

export default class ExploreDropdown extends React.PureComponent<Props, void> {
  static defaultProps = {
    id: 'explore-dropdown',
    sidenav: false
  }

  render () {
    const {t} = this.props
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
          <a href='/groups' className='nav-hover-menu-item'>{t('Groups')}</a>
        </Menu.Item>
      </Menu>
    )
    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <a href='#'>
          {t('Explore')} <Icon type='down' />
        </a>
      </Dropdown>
    )
  }
}
