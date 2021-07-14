import React from 'react'
import { Row, Button, List } from 'antd'
import PresetForm from './PresetForm'
import Actions from '../../actions/LayerActions'
import { PlusOutlined } from '@ant-design/icons'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
import { useSelector } from 'react-redux'
type Props = {
  onValid: () => void
  onInvalid: () => void
}

const PresetEditor = ({ onValid, onInvalid }: Props): JSX.Element => {
  const { t } = useT()
  const pendingPresetChanges = useSelector(
    (state: { layer: any }) => state.layer.pendingPresetChanges
  )
  const presets = useSelector((state: { layer: any }) => state.layer.presets)

  useUnload((e) => {
    e.preventDefault()
    if (pendingPresetChanges) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  return (
    <>
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={(): void => {
            Actions.addPreset()
          }}
        >
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
                onValid={() => {
                  if (onValid) onValid()
                }}
                onInvalid={() => {
                  if (onInvalid) onInvalid()
                }}
              />
            </List.Item>
          )}
        />
      </Row>
    </>
  )
}
export default PresetEditor
