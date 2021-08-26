import React from 'react'
import Link from 'next/link'
import { DownOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'

const ExploreDropdown = ({ t }: { t: (v: string) => string }): JSX.Element => {
  const menu = (
    <Menu>
      <Menu.Item>
        <Link href='/explore'>
          <a className='nav-hover-menu-item'>{t('All')}</a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link href='/maps'>
          <a className='nav-hover-menu-item'>{t('Maps')}</a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link href='/stories'>
          <a className='nav-hover-menu-item'>{t('Stories')}</a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link href='/layers'>
          <a className='nav-hover-menu-item'>{t('Layers')}</a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link href='/groups'>
          <a className='nav-hover-menu-item'>{t('Groups')}</a>
        </Link>
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
