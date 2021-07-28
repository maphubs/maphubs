import React from 'react'
import { useSession } from 'next-auth/client'
import { Menu, Dropdown, message } from 'antd'
import HelpOutline from '@material-ui/icons/HelpOutline'
import useT from '../../hooks/useT'
type Props = {
  sidenav?: boolean
  customHelpLink?: string
}
const HelpDropdown = ({ sidenav, customHelpLink }: Props): JSX.Element => {
  const { t } = useT()
  const [session] = useSession()
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
              if (session?.user?.email)
                UserbackInstance.email = session.user.email
              if (session?.user?.name) UserbackInstance.name = session.user.name
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
