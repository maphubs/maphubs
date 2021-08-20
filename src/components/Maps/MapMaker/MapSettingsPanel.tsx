import React, { useState } from 'react'

import { SettingOutlined } from '@ant-design/icons'
import { Tooltip, Button } from 'antd'
import dynamic from 'next/dynamic'
import useMapT from '../hooks/useMapT'

import { useDispatch, useSelector } from '../redux/hooks'
import { setSettings } from '../redux/reducers/mapMakerSlice'

const CodeEditor = dynamic(() => import('../../LayerDesigner/CodeEditor'), {
  ssr: false
})

const MapSettingsPanel = (): JSX.Element => {
  const { t } = useMapT()
  const dispatch = useDispatch()
  const [showSettingsEditor, setShowSettingsEditor] = useState(false)

  const settings = useSelector((state) => state.mapMaker.settings)

  // TODO: MapMaker Redux State

  const onSave = (settingsUpdate: string): void => {
    const settingsUpdateJSON = JSON.parse(settingsUpdate)
    dispatch(setSettings({ settings: settingsUpdateJSON }))
    setShowSettingsEditor(false)
  }

  return (
    <div>
      <Tooltip title={t('Advanced Map Settings')} placement='top'>
        <Button
          onClick={() => {
            setShowSettingsEditor(true)
          }}
          icon={<SettingOutlined />}
        />
      </Tooltip>

      <CodeEditor
        id='map-settings-editor'
        mode='json'
        visible={showSettingsEditor}
        initialCode={JSON.stringify(settings, undefined, 2)}
        title={t('Advanced Map Settings')}
        onSave={onSave}
        onCancel={() => {
          setShowSettingsEditor(false)
        }}
        modal
      />
    </div>
  )
}
export default MapSettingsPanel
