// @flow
import React from 'react'
import {Modal, ModalContent} from '../Modal/Modal.js'
import MapHubsComponent from '../MapHubsComponent'

import SaveMapPanel from '../MapMaker/SaveMapPanel'

type Props = {|
  title: string,
  onSubmit: Function
|}

export default class CopyMapModal extends MapHubsComponent<Props, void> {
  /**
   * Show the Modal
   */
  show = () => {
    this.refs.modal.show()
  }

  close = () => {
    this.refs.modal.close()
  }

  render () {
    return (
      <Modal ref='modal' id='copy-map-modal' dismissible={false} fixedFooter={false}>
        <ModalContent style={{padding: '10px', margin: 0, height: '500px', background: 'white', overflow: 'hidden'}}>
          <div className='row no-margin' style={{height: '35px'}}>
            <h4>{this.__('Copy Map')}</h4>
            <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
              <i className='material-icons selected-feature-close' style={{fontSize: '35px'}}>close</i>
            </a>
          </div>
          <div className='row no-margin' style={{height: 'calc(100% - 35px)', overflow: 'auto', padding: '10px'}}>
            <div className='row'>
              <SaveMapPanel title={this.props.title} onSave={this.props.onSubmit} />
            </div>
          </div>
        </ModalContent>
      </Modal>
    )
  }
}
