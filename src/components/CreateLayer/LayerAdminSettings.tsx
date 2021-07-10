import React from 'react'
import Formsy from 'formsy-react'
import { Row, Col, notification, Button } from 'antd'
import SelectGroup from '../Groups/SelectGroup'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'

import Toggle from '../forms/toggle'
import type { LayerStoreState } from '../../stores/layer-store'
import type { Group } from '../../stores/GroupStore'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('../LayerDesigner/CodeEditor'), {
  ssr: false
})
type Props = {
  onSubmit: (...args: Array<any>) => any
  onValid?: (...args: Array<any>) => any
  onInValid?: (...args: Array<any>) => any
  submitText: string
  warnIfUnsaved: boolean
  groups: Array<Group>
}
type State = {
  canSubmit: boolean
  pendingChanges: boolean
} & LayerStoreState
export default class LayerAdminSettings extends React.Component<Props, State> {
  props: Props
  static defaultProps:
    | any
    | {
        groups: Array<any>
        showGroup: boolean
        showPrev: boolean
        warnIfUnsaved: boolean
      } = {
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

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  unloadHandler: any

  componentDidMount(): void {
    const { props, state, unloadHandler } = this
    const { warnIfUnsaved } = props
    const { pendingChanges } = state
    this.unloadHandler = (e) => {
      if (warnIfUnsaved && pendingChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', unloadHandler)
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  onFormChange = (): void => {
    this.setState({
      pendingChanges: true
    })
  }
  onValid = (): void => {
    this.setState({
      canSubmit: true
    })

    if (this.props.onValid) {
      this.props.onValid()
    }
  }
  onInvalid = (): void => {
    this.setState({
      canSubmit: false
    })

    if (this.props.onInValid) {
      this.props.onInValid()
    }
  }
  onSubmit = (model: Record<string, any>): void => {
    const { t, props, state, setState } = this
    const { onSubmit } = props
    const { owned_by_group_id, _csrf } = state

    if (!model.group && owned_by_group_id) {
      // editing settings on an existing layer
      model.group = owned_by_group_id
    }

    LayerActions.saveAdminSettings(model, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setState({
          pendingChanges: false
        })

        onSubmit()
      }
    })
  }
  saveExternalLayerConfig = (config: Record<string, any>): void => {
    const { t, state, props, setState } = this
    const { onSubmit } = props
    const { _csrf } = state

    LayerActions.saveExternalLayerConfig(config, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setState({
          pendingChanges: false
        })

        onSubmit()
      }
    })
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      saveExternalLayerConfig,
      onSubmit,
      onFormChange,
      onValid,
      onInvalid
    } = this
    const {
      is_external,
      external_layer_config,
      allow_public_submit,
      disable_export,
      owned_by_group_id,
      canSubmit
    } = state
    const { groups, submitText } = props
    let elcEditor = <></>

    if (is_external && external_layer_config) {
      elcEditor = (
        <Row
          style={{
            height: '300px'
          }}
        >
          <CodeEditor
            id='layer-elc-editor'
            mode='json'
            code={JSON.stringify(external_layer_config, undefined, 2)}
            title={t('External Layer Config')}
            onSave={saveExternalLayerConfig}
            visible
            modal={false}
            t={t}
          />
        </Row>
      )
    }

    return (
      <div
        style={{
          marginRight: '2%',
          marginLeft: '2%',
          marginTop: '10px'
        }}
      >
        <Formsy
          onValidSubmit={onSubmit}
          onChange={onFormChange}
          onValid={onValid}
          onInvalid={onInvalid}
        >
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Col span={12}>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <Toggle
                  name='disableExport'
                  labelOff={t('Allow Export')}
                  labelOn={t('Disable Export')}
                  checked={disable_export}
                />
              </Row>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
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
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <SelectGroup
                  groups={groups}
                  type='layer'
                  group_id={owned_by_group_id}
                  canChangeGroup
                  editing={false}
                />
              </Row>
            </Col>
          </Row>
          <div className='container'>
            <div
              style={{
                float: 'right'
              }}
            >
              <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                {submitText}
              </Button>
            </div>
          </div>
        </Formsy>
      </div>
    )
  }
}
