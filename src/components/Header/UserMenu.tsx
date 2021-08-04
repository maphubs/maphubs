import React from 'react'
import { useRouter } from 'next/router'
import useT from '../../hooks/useT'
import { Menu, Dropdown, Divider, Button } from 'antd'
import UserIcon from '../user/UserIcon'
import urlencode from 'urlencode'
import { signout, useSession } from 'next-auth/client'

const UserMenu = ({ sidenav }: { sidenav?: boolean }): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const [session] = useSession()
  const loginClick = (): void => {
    router.push('/login?returnTo=' + urlencode(window.location.href))
  }

  // only render on the client side, avoids caching a username in SSR
  if (typeof window === 'undefined') {
    return <></>
  }

  let userMenu

  if (session) {
    const { role, image } = session
    const menu = (
      <Menu>
        <Menu.Item>
          <a href={`/user/maps`}>{t('My Maps')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href={`/user/groups`}>{t('My Groups')}</a>
        </Menu.Item>
        <Menu.Item>
          <a href='/user/profile'>{t('Settings')}</a>
        </Menu.Item>
        {role === 'admin' && (
          <>
            <Divider
              style={{
                margin: '10px 0px'
              }}
            />
            <Menu.Item
              style={{
                padding: '0px 10px'
              }}
            >
              <a href='/admin/manage'>{t('Manage Users')}</a>
            </Menu.Item>
          </>
        )}
        <Divider
          style={{
            margin: '10px 0px'
          }}
        />
        <Menu.Item>
          <a
            onClick={(e) => {
              e.preventDefault()
              signout()
            }}
          >
            {t('Logout')}
          </a>
        </Menu.Item>
      </Menu>
    )
    userMenu = (
      <div
        style={{
          backgroundColor: 'inherit',
          height: '50px'
        }}
      >
        <Dropdown overlay={menu} trigger={['click']}>
          <a
            style={{
              height: '50px',
              textAlign: sidenav ? 'left' : 'center'
            }}
            href='#'
          >
            <UserIcon src={image} />
          </a>
        </Dropdown>
      </div>
    )
  } else {
    userMenu =
      process.env.NEXT_PUBLIC_MAPHUBS_PRO !== 'true' ? (
        <div className='login-with-signup'>
          <a
            className='login-with-signup-link'
            style={{
              float: !sidenav ? 'left' : 'inherit'
            }}
            href='#'
            onClick={loginClick}
          >
            {t('Login')}
          </a>
          <Button
            type='primary'
            style={{
              marginLeft: '5px',
              marginRight: '5px',
              color: '#FFF'
            }}
            href='/signup'
          >
            <span
              style={{
                color: '#FFF'
              }}
            >
              {t('Sign Up')}
            </span>
          </Button>
        </div>
      ) : (
        <a
          style={{
            float: !sidenav ? 'left' : 'inherit'
          }}
          href='#'
          onClick={loginClick}
        >
          {t('Login')}
        </a>
      )
  }

  return (
    <>
      <style jsx global>{`
        .login-with-signup:hover {
          background-color: transparent !important;
        }

        .login-with-signup-link {
          cursor: pointer;
        }

        .login-with-signup-link:hover {
          color: $header-font-color !important;
        }
      `}</style>
      {userMenu}
    </>
  )
}
export default UserMenu
