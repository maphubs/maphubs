// @flow
import React from 'react'
import { Row, Button, List } from 'antd'
import PresetForm from './PresetForm'
import LayerStore from '../../stores/layer-store'
import Actions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import { PlusOutlined } from '@ant-design/icons'
import type {MapHubsField} from '../../types/maphubs-field'
import type {LayerStoreState} from '../../stores/layer-store'

type Props = {
  onValid: Function,
  onInvalid: Function,
  warnIfUnsaved: boolean
}

type State = LayerStoreState;

export default class PresetEditor extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    warnIfUnsaved: true
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  componentDidMount () {
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.props.warnIfUnsaved && _this.state.pendingPresetChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    })
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    if (nextState.presets && !this.state.presets) {
      return true
    }
    return !_isequal(nextState.presets, this.state.presets)
  }

  addPreset = () => {
    Actions.addPreset()
  }

  onValid = () => {
    if (this.props.onValid) this.props.onValid()
  }

  onInvalid = () => {
    if (this.props.onInvalid) this.props.onInvalid()
  }

  render () {
    const {t} = this
    const _this = this
    let presets = []
    if (this.state.presets) {
      presets = this.state.presets.toArray()
    }
    return (
      <>
        <Row style={{marginBottom: '20px'}}>
          <Button type='primary' icon={<PlusOutlined />} onClick={this.addPreset}>{t('Add Field')}</Button>
        </Row>
        <Row justify='center' style={{marginBottom: '20px'}}>
          <List
            dataSource={presets}
            bordered
            style={{width: '100%'}}
            renderItem={preset => (
              <List.Item>
                <PresetForm
                  {...preset}
                  onValid={_this.onValid}
                  onInvalid={_this.onInvalid}
                />
              </List.Item>
            )}
          />
        </Row>
      </>
    )
  }
}
