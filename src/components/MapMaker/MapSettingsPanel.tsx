import React, { useState } from 'react'
import MapMakerActions from '../../actions/MapMakerActions'

import type { MapMakerStoreState } from '../../stores/MapMakerStore'
import { SettingOutlined } from '@ant-design/icons'
import { Tooltip, Button } from 'antd'
import dynamic from 'next/dynamic'
import useT from '../../hooks/useT'
const CodeEditor = dynamic(() => import('../LayerDesigner/CodeEditor'), {
  ssr: false
})
type State = {
  showSettingsEditor?: boolean
} & MapMakerStoreState

const MapSettingsPanel = (): JSX.Element => {
  const { t } = useT()
  const [showSettingsEditor, setShowSettingsEditor] = useState(false)

  // TODO: MapMaker Redux State

  const onSave = (settings: string): void => {
    settings = JSON.parse(settings)
    MapMakerActions.setSettings(settings)
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
