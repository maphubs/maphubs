// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import UserStore from '../../stores/UserStore'
import { Menu, Dropdown, Divider, Button } from 'antd'
import Gravatar from '../user/Gravatar'
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

  componentDidMount () {
    this.initDropdown()
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

  componentDidUpdate (prevProps: Props, prevState: State) {
    if (this.state.user && !prevState.user) {
      this.initDropdown()
    }
  }

  initDropdown = () => {
    if (!this.props.sidenav && this.state.user && this.userButton) {
      try {
        M.Dropdown.init(this.userButton, {
          inDuration: 300,
          outDuration: 225,
          constrainWidth: false, // Does not change width of dropdown to that of the activator
          hover: false, // Activate on hover
          gutter: 0, // Spacing from edge
          coverTrigger: false, // Displays dropdown below the button
          alignment: 'right' // Displays dropdown with edge aligned to the left of button
        })
      } catch (err) {
        console.error(err)
      }
    }
  }

  loginClick = () => {
    window.location = '/login?returnTo=' + urlencode(window.location.href)
  }

  render () {
    const {t} = this
    // only render on the client side, avoids caching a username in SSR
    if (typeof window === 'undefined') {
      return ''
    }

    const {user} = this.state
    const {sidenav} = this.props

    let userMenu
    if (user) {
      const {admin, picture, email} = user

      const userIcon = picture ? <UserIcon {...user} /> : <Gravatar email={email} />
      const displayName = (this.state.user && this.state.user.display_name) ? this.state.user.display_name : ''

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
              <Menu.Item>
                <a href='/admin/manage'>{t('Manage Users')}</a>
              </Menu.Item>
            </>
          }
          <Divider style={{margin: '10px 0px'}} />
          <Menu.Item>
            <a href={'/logout'}>{t('Logout')}</a>
          </Menu.Item>
        </Menu>
      )

      userMenu = (
        <div style={{backgroundColor: 'inherit', height: '50px'}}>
          <Dropdown overlay={menu} trigger={['click']}>
            <div ref={(el) => { this.userButton = el }} className='chip user-dropdown-button omh-btn dropdown-trigger' style={{marginRight: '5px', marginLeft: '5px', marginTop: '9px', backgroundColor: '#FFF'}} data-target={this.props.id}>
              {userIcon}
              {displayName}
              <i className='material-icons right' style={{marginLeft: 0, color: '#323333', height: '30px', lineHeight: '30px', width: '15px'}}>arrow_drop_down</i>
            </div>
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
        .usermenu-wrapper:hover {
          color: $navbar-hover-font-color !important;
          background-color: $primary-color !important;

          -o-transition:.5s;
          -ms-transition:.5s;
          -moz-transition:.5s;
          -webkit-transition:.5s;
          transition:.5s;
        }

        .usermenu-wrapper a {
          color: #323333;
        }

        .usermenu-wrapper:hover a {
          color: $navbar-hover-font-color !important;
          background-color: transparent !important;
        }

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
