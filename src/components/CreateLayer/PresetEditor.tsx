import React from 'react'
import { Row, Button, List } from 'antd'
import PresetForm from './PresetForm'
import { PlusOutlined } from '@ant-design/icons'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
import { useDispatch, useSelector } from '../../redux/hooks'
import { addPreset } from '../../redux/reducers/layerSlice'

type Props = {
  onValid: () => void
  onInvalid: () => void
}

const PresetEditor = ({ onValid, onInvalid }: Props): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const pendingPresetChanges = useSelector(
    (state) => state.layer.pendingPresetChanges
  )
  const presets = useSelector((state) => state.layer.presets)

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
            dispatch(addPreset())
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
                {...presets}
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
