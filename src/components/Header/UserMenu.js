// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import UserStore from '../../stores/UserStore'
// import UserActions from '../actions/UserActions'
import Gravatar from '../user/Gravatar'
import UserIcon from '../user/UserIcon'
import _isequal from 'lodash.isequal'
import urlencode from 'urlencode'
import type {UserStoreState} from '../../stores/UserStore'

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

      let userIcon = picture ? <UserIcon {...user} /> : <Gravatar email={email} />

      const displayName = (this.state.user && this.state.user.display_name) ? this.state.user.display_name : ''
      if (sidenav) {
        userMenu = (
          <div>
            <ul id={this.props.id} style={{top: '100px'}}>
              <li className='divider' />
              <li className='nav-link-wrapper'><a href={`/user/${displayName}/maps`}>{t('My Maps')}</a></li>
              <li className='nav-link-wrapper'><a href={`/user/${displayName}/stories`}>{t('My Stories')}</a></li>
              <li className='nav-link-wrapper'><a href={`/user/${displayName}/groups`}>{t('My Groups')}</a></li>
              <li className='nav-link-wrapper'><a href='/user/profile'>{t('Settings')}</a></li>
              {admin &&
                <li className='nav-link-wrapper'><a href='/admin/manage'>{t('Manage Users')}</a></li>
              }
              <li className='nav-link-wrapper'><a href={'/logout'}>{t('Logout')}</a></li>
            </ul>
          </div>
        )
      } else {
        userMenu = (
          <li className='nav-link-wrapper' style={{backgroundColor: 'inherit'}}>
            <div ref={(el) => { this.userButton = el }} className='chip user-dropdown-button omh-btn dropdown-trigger' style={{marginRight: '5px', marginLeft: '5px', marginTop: '9px', backgroundColor: '#FFF'}} data-target={this.props.id}>
              {userIcon}
              {displayName}
              <i className='material-icons right' style={{marginLeft: 0, color: '#212121', height: '30px', lineHeight: '30px', width: '15px'}}>arrow_drop_down</i>
            </div>
            <ul id={this.props.id} className='dropdown-content' style={{top: '100px'}}>
              <li className='usermenu-wrapper'><a href={`/user/${displayName}/maps`}>{t('My Maps')}</a></li>
              <li className='divider' />
              <li className='usermenu-wrapper'><a href={`/user/${displayName}/stories`}>{t('My Stories')}</a></li>
              <li className='divider' />
              <li className='usermenu-wrapper'><a href={`/user/${displayName}/groups`}>{t('My Groups')}</a></li>
              <li className='divider' />
              <li className='usermenu-wrapper'><a href='/user/profile'>{t('Settings')}</a></li>
              {admin &&
                <li className='usermenu-wrapper'><a href='/admin/manage'>{t('Manage Users')}</a></li>
              }
              <li className='divider' />
              <li className='usermenu-wrapper'><a href={'/logout'}>{t('Logout')}</a></li>
            </ul>

          </li>
        )
      }
    } else {
      let style = {}
      if (!this.props.sidenav) {
        style = {marginLeft: '1px', marginRight: '5px'}
      }
      if (!MAPHUBS_CONFIG.mapHubsPro) {
        userMenu = (
          <li className='nav-link-wrapper login-with-signup'>
            <a className='nav-link-item login-with-signup-link' style={{float: !this.props.sidenav ? 'left' : 'inherit'}} href='#' onClick={this.loginClick}>{t('Login')}</a>
            <a className='btn' style={style} href='/signup'>{t('Sign Up')}</a>
          </li>
        )
      } else {
        userMenu = (
          <li className='nav-link-wrapper'>
            <a className='nav-link-item' style={{float: !this.props.sidenav ? 'left' : 'inherit'}} href='#' onClick={this.loginClick}>{t('Login')}</a>
          </li>
        )
      }
    }

    return userMenu
  }
}
