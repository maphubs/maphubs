// @flow
import type {Element} from "React";import React from 'react'
import Formsy from 'formsy-react'
import { Row, Col, notification, Button } from 'antd'
import SelectGroup from '../Groups/SelectGroup'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import Toggle from '../forms/toggle'

import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import type {Group} from '../../stores/GroupStore'

import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('../LayerDesigner/CodeEditor'), {
  ssr: false
})

type Props = {|
  onSubmit: Function,
  onValid?: Function,
  onInValid?: Function,
  submitText: string,
  warnIfUnsaved: boolean,
  groups: Array<Group>
|}

type State = {
  canSubmit: boolean,
  pendingChanges: boolean
} & LocaleStoreState & LayerStoreState

export default class LayerAdminSettings extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: 
  | any
  | {|
    groups: Array<any>,
    showGroup: boolean,
    showPrev: boolean,
    warnIfUnsaved: boolean,
  |} = {
    showGroup: true,
    warnIfUnsaved: false,
    showPrev: false,
    groups: []
  }

  state: State = {
    canSubmit: false,
    pendingChanges: false,
    layer: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  unloadHandler: any

  componentDidMount () {
    const _this = this
    this.unloadHandler = (e) => {
      if (_this.props.warnIfUnsaved && _this.state.pendingChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  onFormChange: any | (() => void) = () => {
    this.setState({pendingChanges: true})
  }

  onValid: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
    if (this.props.onValid) {
      this.props.onValid()
    }
  }

  onInvalid: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
    if (this.props.onInValid) {
      this.props.onInValid()
    }
  }

  onSubmit: any | ((model: any) => void) = (model: Object) => {
    const {t} = this
    const _this = this

    if (!model.group && this.state.owned_by_group_id) {
      // editing settings on an existing layer
      model.group = this.state.owned_by_group_id
    }

    LayerActions.saveAdminSettings(model, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        _this.setState({pendingChanges: false})
        _this.props.onSubmit()
      }
    })
  }

  saveExternalLayerConfig: any | ((config: any) => void) = (config: Object) => {
    const {t} = this
    const _this = this
    LayerActions.saveExternalLayerConfig(config, _this.state._csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        _this.setState({pendingChanges: false})
        _this.props.onSubmit()
      }
    })
  }

  render (): Element<"div"> {
    const {t} = this
    const {is_external, external_layer_config, allow_public_submit, disable_export, owned_by_group_id} = this.state

    let elcEditor = ''
    if (is_external && external_layer_config) {
      elcEditor = (
        <Row style={{height: '300px'}}>
          <CodeEditor
            id='layer-elc-editor' mode='json'
            code={JSON.stringify(external_layer_config, undefined, 2)}
            title={t('External Layer Config')}
            onSave={this.saveExternalLayerConfig} visible modal={false} t={t}
          />
        </Row>
      )
    }
    return (
      <div style={{marginRight: '2%', marginLeft: '2%', marginTop: '10px'}}>
        <Formsy onValidSubmit={this.onSubmit} onChange={this.onFormChange} onValid={this.onValid} onInvalid={this.onInValid}>
          <Row style={{marginBottom: '20px'}}>
            <Col span={12}>
              <Row style={{marginBottom: '20px'}}>
                <Toggle
                  name='disableExport'
                  labelOff={t('Allow Export')}
                  labelOn={t('Disable Export')}
                  checked={disable_export}
                />
              </Row>
              <Row style={{marginBottom: '20px'}}>
                <Toggle
                  name='allowPublicSubmit'
                  labelOff={t('Disabled')}
                  labelOn={t('Allow Public Data Submission')}
                  checked={allow_public_submit}
                />
              </Row>
              {elcEditor}
            </Col>
            <Col span={12}>
              <Row style={{marginBottom: '20px'}}>
                <SelectGroup
                  groups={this.props.groups}
                  type='layer'
                  group_id={owned_by_group_id}
                  canChangeGroup editing={false}
                />
              </Row>
            </Col>
          </Row>
          <div className='container'>
            <div style={{float: 'right'}}>
              <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{this.props.submitText}</Button>
            </div>
          </div>
        </Formsy>
      </div>
    )
  }
}
