import React from 'react'

import UserStore from '../../stores/UserStore'
import { Menu, Dropdown, Divider, Button } from 'antd'
import UserIcon from '../user/UserIcon'
import _isequal from 'lodash.isequal'
import urlencode from 'urlencode'
import type { UserStoreState } from '../../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  id: string
  sidenav: boolean
}
type State = UserStoreState
export default class UserMenu extends React.Component<Props, State> {
  props: Props
  userButton: any
  static defaultProps: Props = {
    id: 'user-menu',
    sidenav: false
  }
  state: State

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore]
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  loginClick = (): void => {
    window.location.assign('/login?returnTo=' + urlencode(window.location.href))
  }

  render(): JSX.Element {
    const { t, props, state, loginClick } = this
    const { sidenav } = props

    // only render on the client side, avoids caching a username in SSR
    if (typeof window === 'undefined') {
      return <></>
    }

    const { user } = state
    let userMenu

    if (user) {
      const { admin, picture, display_name } = user
      const menu = (
        <Menu>
          <Menu.Item>
            <a href={`/user/${display_name}/maps`}>{t('My Maps')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href={`/user/${display_name}/groups`}>{t('My Groups')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/user/profile'>{t('Settings')}</a>
          </Menu.Item>
          {admin && (
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
            <a href='/logout'>{t('Logout')}</a>
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
                paddingTop: '7px',
                height: '50px',
                textAlign: sidenav ? 'left' : 'center'
              }}
              href='#'
            >
              <UserIcon src={picture} t={t} />
            </a>
          </Dropdown>
        </div>
      )
    } else {
      userMenu = !MAPHUBS_CONFIG.mapHubsPro ? (
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
}
