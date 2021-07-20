import React, { useState } from 'react'
import Formsy from 'formsy-react'
import { Row, Col, notification, Button } from 'antd'
import SelectGroup from '../Groups/SelectGroup'
import LayerActions from '../../actions/LayerActions'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
import Toggle from '../forms/toggle'
import type { LayerStoreState } from '../../stores/layer-store'
import dynamic from 'next/dynamic'
import { useSelector } from 'react-redux'
import { Group } from '../../types/group'
const CodeEditor = dynamic(() => import('../LayerDesigner/CodeEditor'), {
  ssr: false
})
type Props = {
  onSubmit: (...args: Array<any>) => any
  submitText: string
  warnIfUnsaved?: boolean
  groups: Group[]
}

type State = {
  canSubmit: boolean
  pendingChanges: boolean
} & LayerStoreState

const LayerAdminSettings = ({
  groups,
  submitText,
  warnIfUnsaved,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useT()
  const [canSubmit, setCanSubmit] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(false)

  const layerState = useSelector((state: { layer: any }) => state.layer)

  useUnload((e) => {
    e.preventDefault()
    if (warnIfUnsaved && pendingChanges) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const submit = (model: Record<string, any>): void => {
    const { owned_by_group_id } = layerState

    if (!model.group && owned_by_group_id) {
      // editing settings on an existing layer
      model.group = owned_by_group_id
    }

    LayerActions.saveAdminSettings(model, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setPendingChanges(false)
        onSubmit()
      }
    })
  }
  const saveExternalLayerConfig = (config: string): void => {
    LayerActions.saveExternalLayerConfig(config, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setPendingChanges(false)
        onSubmit()
      }
    })
  }

  const {
    is_external,
    external_layer_config,
    allow_public_submit,
    disable_export,
    owned_by_group_id
  } = layerState

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
          initialCode={JSON.stringify(external_layer_config, undefined, 2)}
          title={t('External Layer Config')}
          onSave={saveExternalLayerConfig}
          visible
          modal={false}
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
        onValidSubmit={submit}
        onChange={() => {
          setPendingChanges(true)
        }}
        onValid={() => {
          setCanSubmit(true)
        }}
        onInvalid={() => {
          setCanSubmit(false)
        }}
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
export default LayerAdminSettings
