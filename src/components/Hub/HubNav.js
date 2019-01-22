// @flow
import React from 'react'
import UserMenu from '../Header/UserMenu'
import LocaleChooser from '../LocaleChooser'
import NotificationActions from '../../actions/NotificationActions'
import ConfirmationActions from '../../actions/ConfirmationActions'
import MessageActions from '../../actions/MessageActions'
import HubActions from '../../actions/HubActions'
import MapHubsPureComponent from '../../components/MapHubsPureComponent'

import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

type Props = {
  hubid: string,
  canEdit: boolean
}

export default class HubHav extends MapHubsPureComponent<Props, void> {
  static defaultProps = {
    canEdit: false
  }

  componentDidMount () {
    M.Sidenav.init(this.refs.hubNav, {edge: 'right'})
  }

  deleteHub = () => {
    const {t} = this
    const _this = this
    ConfirmationActions.showConfirmation({
      title: t('Confirm Hub Deletion'),
      message: t('Please confirm that you want to delete this hub and all of its stories.'),
      onPositiveResponse () {
        HubActions.deleteHub(_this.state._csrf, (err) => {
          if (err) {
            MessageActions.showMessage({title: t('Error'), message: err})
          } else {
            NotificationActions.showNotification({
              message: t('Hub Deleted'),
              dismissAfter: 7000,
              onDismiss () {
                window.location = '/hubs'
              }
            })
          }
        })
      }
    })
  }

  render () {
    const {t} = this
    const omhBaseUrl = urlUtil.getBaseUrl()

    const hubBaseUrl = omhBaseUrl + '/hub/' + this.props.hubid + '/'

    let deleteButton = ''
    if (this.props.canEdit) {
      deleteButton = (
        <li className='nav-link-wrapper'><a href='#' onClick={this.deleteHub}>{t('Delete Hub')}</a></li>
      )
    }
    return (
      <nav className='white' style={{height: '0px'}}>
        <div className='nav-wrapper'>
          <a href='#' data-target='nav' className='button-collapse white-text text-shadow sidenav-trigger'
            style={{display: 'block', position: 'absolute', top: '5px', right: '5px', zIndex: 1}}>
            <i className='material-icons'>menu</i>
          </a>
          <ul ref='hubNav' className='sidenav' id='nav'>
            <li className='nav-link-wrapper'><a href={hubBaseUrl}>{t('Home')}</a></li>
            <li className='nav-link-wrapper'><a href={hubBaseUrl + 'stories'}>{t('Stories')}</a></li>
            <li className='nav-link-wrapper'><a href={hubBaseUrl + 'resources'}>{t('Resources')}</a></li>
            <LocaleChooser />
            <hr />
            <li className='nav-link-wrapper'><a href={omhBaseUrl}>{t('Back to ') + MAPHUBS_CONFIG.productName}</a></li>
            {deleteButton}
            <UserMenu id='user-menu-sidenav' sidenav />
          </ul>
        </div>
      </nav>
    )
  }
}
