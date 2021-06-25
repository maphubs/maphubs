import React from 'react'
import { Menu, Dropdown, message } from 'antd'
import HelpOutline from '@material-ui/icons/HelpOutline'
type Props = {
  t: any
  sidenav?: boolean
  customHelpLink?: string
}
const HelpDropdown = ({ t, sidenav, customHelpLink }: Props): JSX.Element => {
  const menu = (
    <Menu>
      <Menu.Item>
        <a
          href={customHelpLink || 'https://help.maphubs.com'}
          className='nav-hover-menu-item'
        >
          {t('Help Documentation')}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a
          href='#'
          onClick={() => {
            // eslint-disable-next-line no-undef
            const UserbackInstance = Userback

            if (UserbackInstance) {
              UserbackInstance.open()
            } else {
              message.info(
                'Feedback tool not enabled, please contact support@maphubs.com'
              )
            }
          }}
        >
          {t('Questions/Feedback')}
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
        {sidenav && <a href='#!'>{t('Help/Support')}</a>}
        {!sidenav && (
          <HelpOutline
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
export default HelpDropdown
