import React from 'react'
import { Menu, Dropdown } from 'antd'
import AddCircle from '@material-ui/icons/AddCircle'
type Props = {
  t: any
  sidenav?: boolean
}
const AddDropdown = ({ t, sidenav }: Props): JSX.Element => {
  const menu = (
    <Menu>
      <Menu.Item>
        <a href='/map/new' className='nav-hover-menu-item'>
          {t('New Map')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/createlayer' className='nav-hover-menu-item'>
          {t('New Layer')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/creategroup' className='nav-hover-menu-item'>
          {t('New Group')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/createstory' className='nav-hover-menu-item'>
          {t('New Story')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/createremotelayer' className='nav-hover-menu-item'>
          {t('Remote Layer')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/import' className='nav-hover-menu-item'>
          {t('Import MapHubs File')}
        </a>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <a
        style={{
          paddingTop: '7px',
          height: '50px',
          textAlign: sidenav ? 'left' : 'center'
        }}
        href='#'
      >
        {sidenav && <a href='#!'>{t('Add')}</a>}
        {!sidenav && (
          <AddCircle
            style={{
              fill: 'currentColor',
              width: '1em',
              height: '1em',
              display: 'inline-block',
              fontSize: '24px'
            }}
          />
        )}
      </a>
    </Dropdown>
  )
}
export default AddDropdown
