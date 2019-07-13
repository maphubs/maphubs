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
          <a href='/createstory' className='nav-hover-menu-item'>{t('New Story')}</a>
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
      <li className='nav-link-wrapper' style={{height: '50px', overflow: 'hidden', width: '30px'}} >
        <Dropdown overlay={menu} trigger={['click']}>
          <a className='nav-link-item' style={{padding: '0px', marginTop: '6px', textAlign: 'center'}} href='#'>
            <AddCircle style={{
              fill: 'currentColor',
              width: '1em',
              height: '1em',
              display: 'inline-block',
              fontSize: '24px'
            }}
            />
          </a>
        </Dropdown>
      </li>
    )
  }
}
