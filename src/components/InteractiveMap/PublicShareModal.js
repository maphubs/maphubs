// @flow
import React from 'react'
import {Modal, ModalContent} from '../Modal/Modal.js'
import MapHubsComponent from '../MapHubsComponent'
import Toggle from '../forms/toggle'
import ConfirmationActions from '../../actions/ConfirmationActions'
import Formsy from 'formsy-react'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import urlUtil from '../../services/url-util'

type Props = {|
  share_id: string,
  onChange: Function
|}

type State = {
  sharing: boolean
} & LocaleStoreState

export default class PublicShareModal extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)

    this.state = {
      sharing: !!this.props.share_id
    }
  }

  clipboard: any

  componentDidMount () {
    this.clipboard = require('clipboard-polyfill')
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!this.props.share_id && nextProps.share_id) {
      this.setState({sharing: true})
    }
  }

  /**
   * Show the Modal
   */
  show = () => {
    this.refs.modal.show()
  }

   close = () => {
     this.refs.modal.close()
   }

  onChange = (model: Object) => {
    const _this = this
    if (model.public) {
      ConfirmationActions.showConfirmation({
        title: this.__('Share Map'),
        postitiveButtonText: this.__('Create Public Share Link'),
        negativeButtonText: this.__('Cancel'),
        message: this.__('Please confirm that you wish to publicly share this map and the data in the associated map layers publicly with anyone who has the link.'),
        onPositiveResponse () {
          _this.props.onChange(model.public)
        }
      })
    } else {
      ConfirmationActions.showConfirmation({
        title: this.__('Deactivate Map Sharing'),
        postitiveButtonText: this.__('Stop Sharing'),
        negativeButtonText: this.__('Cancel'),
        message: this.__('Warning! The shared link will be destroyed and all shared/embedded maps will no longer work. For security reasons, sharing this map again will generate a new link and will not reactivate the current link.'),
        onPositiveResponse () {
          _this.props.onChange(model.public)
        }
      })
    }
  }

  writeToClipboard = () => {
    const shareUrl = urlUtil.getBaseUrl() + `/map/share/${this.props.share_id}`
    this.clipboard.writeText(shareUrl)
  }

  render () {
    let shareLink = ''
    let shareMessage = ''
    if (this.props.share_id && this.state.sharing) {
      const shareUrl = urlUtil.getBaseUrl() + `/map/share/${this.props.share_id}`
      shareLink = (
        <div>
          <p style={{fontSize: '16px'}}><b>{this.__('Share Link: ')}</b>
          &nbsp;-&nbsp;
            <a href={shareUrl} target='_blank' rel='noopener noreferrer'>{shareUrl}</a>
            <i className='material-icons omh-accent-text' style={{cursor: 'pointer'}} onClick={this.writeToClipboard}>launch</i>
          </p>
          <button onClick={this.writeToClipboard} className='btn'>{this.__('Copy Link')}</button>
          <p className='no-margin'>{this.__('Warning: disabling sharing will invalidate the current link. Sharing again will generate a new unique link.')}</p>
        </div>
      )

      shareMessage = (
        <p style={{fontSize: '16px'}}><b>{this.__('Sharing')}</b>&nbsp;-&nbsp;<span>{this.__('Anyone can use this link to view the map.')}</span></p>
      )
    } else {
      shareMessage = (
        <p style={{fontSize: '16px'}}><b>{this.__('Protected')}</b>&nbsp;-&nbsp;<span>{this.__('Only authorized users can see this map.')}</span></p>
      )
      shareLink = (
        <div>
          <p>{this.__('Create a public link to this map and associated map layers that can be viewed by anyone with the link without needing a MapHubs account or permissions on this site.')}</p>
        </div>
      )
    }

    return (
      <Modal ref='modal' id='public-share-modal' dismissible={false} fixedFooter={false}>
        <ModalContent style={{padding: '10px', margin: 0, height: '350px', overflow: 'hidden'}}>
          <div className='row no-margin' style={{height: '35px'}}>
            <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
              <i className='material-icons selected-feature-close' style={{fontSize: '35px'}}>close</i>
            </a>
          </div>
          <div className='row no-margin' style={{height: 'calc(100% - 35px)', overflow: 'auto', padding: '10px'}}>

            <div className='row'>
              {shareMessage}
            </div>
            <div className='row'>
              <Formsy ref='form' onChange={this.onChange}>
                <Toggle name='public' labelOff={this.__('Off')} labelOn={this.__('Share')} checked={this.state.sharing} className='col s12' />
              </Formsy>
            </div>
            <div className='row'>
              {shareLink}
            </div>
          </div>
        </ModalContent>
      </Modal>
    )
  }
}
