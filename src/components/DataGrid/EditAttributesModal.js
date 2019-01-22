// @flow
import React from 'react'
import {Modal, ModalContent, ModalFooter} from '../Modal/Modal.js'
import MapHubsComponent from '../MapHubsComponent'
import DataCollectionForm from '../DataCollection/DataCollectionForm'
import MessageActions from '../../actions/MessageActions'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {MapHubsField} from '../../types/maphubs-field'

import request from 'superagent'
import {checkClientError} from '../../services/client-error-response'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import _assignIn from 'lodash.assignin'

const debug = DebugService('EditAttributeModal')

type Props = {|
  feature: Object,
  presets: Array<MapHubsField>,
  layer_id: number,
  onSave?: Function
|}

type State = {
  values: Object
} & LocaleStoreState

export default class EditAttributesModal extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    const values = props.feature ? props.feature.properties : {}
    this.state = {
      values
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!this.props.feature && nextProps.feature) {
      this.setState({values: nextProps.feature.properties})
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

  onChange = (data: Object) => {
    _assignIn(this.state.values, data)
  }

  /**
   * Save data to server
   */
  onSave = () => {
    const _this = this

    const feature = this.props.feature
    _assignIn(feature.properties, this.state.values)
    feature.id = feature.properties.mhid

    const edits = [
      {
        status: 'modify',
        geojson: feature
      }
    ]

    request.post('/api/edits/save')
      .type('json').accept('json')
      .send({
        layer_id: this.props.layer_id,
        edits,
        _csrf: this.state._csrf
      })
      .end((err, res) => {
        checkClientError(res, err, () => {}, () => {
          if (err) {
          // show error message
            debug.error(err)
            MessageActions.showMessage({title: 'Error', message: err})
          } else {
            _this.close()
            if (_this.props.onSave) {
              _this.props.onSave(_this.state.values)
            }
          }
        })
      })
  }

  render () {
    const {t} = this
    return (
      <Modal ref='modal' className='edit-attributes-modal' dismissible={false} fixedFooter>
        <ModalContent style={{padding: 0, margin: 0, height: 'calc(100% - 60px)', overflow: 'hidden'}}>
          <div className='row no-margin' style={{height: '35px'}}>
            <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
              <i className='material-icons selected-feature-close' style={{fontSize: '35px'}}>close</i>
            </a>
          </div>
          <div className='row no-margin' style={{height: 'calc(100% - 35px)', overflow: 'auto', padding: '10px'}}>
            <DataCollectionForm presets={this.props.presets}
              values={this.state.values}
              onChange={this.onChange}
              showSubmit={false} />
          </div>
        </ModalContent>
        <ModalFooter>
          <button className='btn omh-color omh-btn-text-color' onClick={this.onSave}>{t('Save')}</button>
        </ModalFooter>
      </Modal>
    )
  }
}
