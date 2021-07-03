import React from 'react'
import { DownOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'

const ExploreDropdown = ({ t }: { t: (v: string) => string }): JSX.Element => {
  const menu = (
    <Menu>
      <Menu.Item>
        <a href='/explore' className='nav-hover-menu-item'>
          {t('All')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/maps' className='nav-hover-menu-item'>
          {t('Maps')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/stories' className='nav-hover-menu-item'>
          {t('Stories')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/layers' className='nav-hover-menu-item'>
          {t('Layers')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a href='/groups' className='nav-hover-menu-item'>
          {t('Groups')}
        </a>
      </Menu.Item>
    </Menu>
  )
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <a href='#'>
        {t('Explore')} <DownOutlined />
      </a>
    </Dropdown>
  )
}
export default ExploreDropdown
