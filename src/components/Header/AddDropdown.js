// @flow
import React from 'react'
import { Menu, Dropdown } from 'antd'
import AddCircle from '@material-ui/icons/AddCircle'

type Props = {
  t: Function
}

export default class AddDropdown extends React.PureComponent<Props, void> {
  render () {
    const {t} = this.props

    const menu = (
      <Menu>
        <Menu.Item>
          <a href='/createlayer' className='nav-hover-menu-item'>{t('New Layer')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href='/creategroup' className='nav-hover-menu-item'>{t('New Group')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href='/user/createstory' className='nav-hover-menu-item'>{t('New Story')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href='/createhub' className='nav-hover-menu-item'>{t('New Hub')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href='/createremotelayer' className='nav-hover-menu-item'>{t('Remote Layer')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href='/importlayer' className='nav-hover-menu-item'>{t('Import MapHubs Layer')}</a>
        </Menu.Item>
      </Menu>
    )
    return (
      <li className='nav-link-wrapper' style={{width: '30px'}}>
        <Dropdown overlay={menu} trigger={['click']}>
          <a className='nav-link-item' style={{padding: '0px', marginTop: '6px', textAlign: 'center'}} href='#'>
            <AddCircle />
          </a>
        </Dropdown>
      </li>
    )
  }
}
