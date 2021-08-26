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
        <a href='/create/layer' className='nav-hover-menu-item'>
          {t('New Layer')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/create/group' className='nav-hover-menu-item'>
          {t('New Group')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/create/story' className='nav-hover-menu-item'>
          {t('New Story')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/create/remotelayer' className='nav-hover-menu-item'>
          {t('Remote Layer')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/layer/import' className='nav-hover-menu-item'>
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
