import React from 'react'
import { Row, Button, List } from 'antd'
import PresetForm from './PresetForm'
import LayerStore from '../../stores/layer-store'
import Actions from '../../actions/LayerActions'

import _isequal from 'lodash.isequal'
import { PlusOutlined } from '@ant-design/icons'
import type { LayerStoreState } from '../../stores/layer-store'
type Props = {
  onValid: (...args: Array<any>) => any
  onInvalid: (...args: Array<any>) => any
  warnIfUnsaved: boolean
}
type State = LayerStoreState
export default class PresetEditor extends React.Component<Props, State> {
  props: Props
  static defaultProps:
    | any
    | {
        warnIfUnsaved: boolean
      } = {
    warnIfUnsaved: true
  }

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  unloadHandler: any

  componentDidMount(): void {
    const { props, state, unloadHandler } = this
    const { pendingPresetChanges } = state
    const { warnIfUnsaved } = props

    this.unloadHandler = (e) => {
      if (warnIfUnsaved && pendingPresetChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', unloadHandler)
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    if (nextState.presets && !this.state.presets) {
      return true
    }

    return !_isequal(nextState.presets, this.state.presets)
  }

  addPreset = (): void => {
    Actions.addPreset()
  }
  onValid = (): void => {
    if (this.props.onValid) this.props.onValid()
  }
  onInvalid = (): void => {
    if (this.props.onInvalid) this.props.onInvalid()
  }

  render(): JSX.Element {
    const { t, state, addPreset, onValid, onInvalid } = this
    const { presets } = state

    return (
      <>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Button type='primary' icon={<PlusOutlined />} onClick={addPreset}>
            {t('Add Field')}
          </Button>
        </Row>
        <Row
          justify='center'
          style={{
            marginBottom: '20px'
          }}
        >
          <List
            dataSource={presets}
            bordered
            style={{
              width: '100%'
            }}
            renderItem={(preset) => (
              <List.Item>
                <PresetForm
                  {...presets.toArray()}
                  onValid={onValid}
                  onInvalid={onInvalid}
                />
              </List.Item>
            )}
          />
        </Row>
      </>
    )
  }
}
