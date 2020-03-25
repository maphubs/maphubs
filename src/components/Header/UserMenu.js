// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import UserStore from '../../stores/UserStore'
import { Menu, Dropdown, Divider, Button } from 'antd'
import UserIcon from '../user/UserIcon'
import _isequal from 'lodash.isequal'
import urlencode from 'urlencode'
import type {UserStoreState} from '../../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
    id: string,
    sidenav: boolean
  }

type State = UserStoreState

export default class UserMenu extends MapHubsComponent<Props, State> {
  props: Props

  userButton: any

  static defaultProps: Props = {
    id: 'user-menu',
    sidenav: false
  }

  state: State

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes

    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  loginClick = () => {
    window.location = '/login?returnTo=' + urlencode(window.location.href)
  }

  render () {
    const {t} = this
    const { sidenav } = this.props
    // only render on the client side, avoids caching a username in SSR
    if (typeof window === 'undefined') {
      return ''
    }

    const {user} = this.state

    let userMenu
    if (user) {
      const {admin, picture} = user

      const displayName = user?.display_name

      const menu = (
        <Menu>
          <Menu.Item>
            <a href={`/user/${displayName}/maps`}>{t('My Maps')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href={`/user/${displayName}/groups`}>{t('My Groups')}</a>
          </Menu.Item>
          <Menu.Item>
            <a href='/user/profile'>{t('Settings')}</a>
          </Menu.Item>
          {admin &&
            <>
              <Divider style={{margin: '10px 0px'}} />
              <Menu.Item style={{padding: '0px 10px'}}>
                <a href='/admin/manage'>{t('Manage Users')}</a>
              </Menu.Item>
            </>}
          <Divider style={{margin: '10px 0px'}} />
          <Menu.Item>
            <a href='/logout'>{t('Logout')}</a>
          </Menu.Item>
        </Menu>
      )

      userMenu = (
        <div style={{backgroundColor: 'inherit', height: '50px'}}>
          <Dropdown overlay={menu} trigger={['click']}>
            <a style={{paddingTop: '7px', height: '50px', textAlign: sidenav ? 'left' : 'center'}} href='#'>
              <UserIcon src={picture} t={t} />
            </a>
          </Dropdown>
        </div>
      )
    } else {
      if (!MAPHUBS_CONFIG.mapHubsPro) {
        userMenu = (
          <div className='login-with-signup'>
            <a className='login-with-signup-link' style={{float: !this.props.sidenav ? 'left' : 'inherit'}} href='#' onClick={this.loginClick}>{t('Login')}</a>
            <Button type='primary' style={{marginLeft: '5px', marginRight: '5px', color: '#FFF'}} href='/signup'>
              <span style={{color: '#FFF'}}>{t('Sign Up')}</span>
            </Button>
          </div>
        )
      } else {
        userMenu = (
          <a style={{float: !this.props.sidenav ? 'left' : 'inherit'}} href='#' onClick={this.loginClick}>{t('Login')}</a>
        )
      }
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
