// @flow
import React from 'react'
import { Modal, Button, Row, notification } from 'antd'
import DataCollectionForm from '../DataCollection/DataCollectionForm'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {MapHubsField} from '../../types/maphubs-field'
import request from 'superagent'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import _assignIn from 'lodash.assignin'

const debug = DebugService('EditAttributeModal')

type Props = {|
  feature: Object,
  presets: Array<MapHubsField>,
  layer_id: number,
  onSave?: Function,
  t: Function,
  _csrf: string
|}

type State = {
  show: boolean,
  modified: boolean,
  values: Object
} & LocaleStoreState

export default class EditAttributesModal extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    const values = props.feature ? props.feature.properties : {}
    this.state = {
      values,
      show: false,
      modified: false
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!this.props.feature && nextProps.feature) {
      this.setState({values: nextProps.feature.properties})
    }
  }

  show = () => {
    this.setState({show: true})
  }

  hide = () => {
    this.setState({show: false})
  }

  onChange = (data: Object) => {
    _assignIn(this.state.values, data)
    this.setState({modified: true})
  }

  /**
   * Save data to server
   */
  onSave = async () => {
    const _this = this
    const { feature, layer_id, _csrf } = this.props
    const { values } = this.state

    _assignIn(feature.properties, values)
    feature.id = feature.properties.mhid

    const edits = [
      {
        status: 'modify',
        geojson: feature
      }
    ]
    try {
      const res = await request.post('/api/edits/save')
        .type('json').accept('json')
        .send({
          layer_id,
          edits,
          _csrf
        })
      if (res.body && res.body.success) {
        if (this.props.onSave) {
          this.props.onSave(_this.state.values)
        }
        this.setState({modified: false, show: false})
      } else {
        throw new Error(res.body.error || 'Error saving attributes')
      }
    } catch (err) {
      debug.error(err)
      notification.error({
        message: 'Error',
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  render () {
    const { t, presets } = this.props
    const { show, modified, values } = this.state
    return (
      <>
        <style jsx global> {`
          .ant-modal-content {
            height: 100%;
          }
          `}</style>
        <Modal
          title={t('Edit Attributes')}
          visible={show}
          onOk={this.onSave}
          width={400}
          height='80vh'
          centered
          bodyStyle={{height: 'calc(100% - 110px)', padding: '5px'}}
          footer={[
            <Button key='back' onClick={this.hide}>
              {t('Cancel')}
            </Button>,
            <Button key='submit' type='primary' disabled={!modified} onClick={this.onSave}>
              {t('Save')}
            </Button>
          ]}
          onCancel={this.hide}
        >
          <Row style={{height: 'calc(100% - 35px)', overflow: 'auto'}}>
            <DataCollectionForm presets={presets}
              values={values}
              onChange={this.onChange}
              showSubmit={false} />
          </Row>
        </Modal>
      </>
    )
  }
}
