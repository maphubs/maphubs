import React from 'react'
import MapMakerStore from '../../stores/MapMakerStore'
import MapMakerActions from '../../actions/MapMakerActions'

import type { MapMakerStoreState } from '../../stores/MapMakerStore'
import { SettingOutlined } from '@ant-design/icons'
import { Tooltip, Button } from 'antd'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('../LayerDesigner/CodeEditor'), {
  ssr: false
})
type State = {
  showSettingsEditor?: boolean
} & MapMakerStoreState
export default class MapSettingsPanel extends React.Component<void, State> {
  stores: any
  constructor() {
    super()
    this.stores = [MapMakerStore]
  }

  onSave = (settings: string): void => {
    settings = JSON.parse(settings)
    MapMakerActions.setSettings(settings)
    this.setState({
      showSettingsEditor: false
    })
  }
  showSettingsEditor = (): void => {
    this.setState({
      showSettingsEditor: true
    })
  }
  hideSettingsEditor = (): void => {
    this.setState({
      showSettingsEditor: false
    })
  }

  render(): JSX.Element {
    const { t, state, onSave, hideSettingsEditor } = this
    const { showSettingsEditor, settings } = state
    return (
      <div>
        <Tooltip title={t('Advanced Map Settings')} placement='top'>
          <Button
            onClick={this.showSettingsEditor}
            icon={<SettingOutlined />}
          />
        </Tooltip>

        <CodeEditor
          id='map-settings-editor'
          mode='json'
          visible={showSettingsEditor}
          code={JSON.stringify(settings, undefined, 2)}
          title={t('Advanced Map Settings')}
          onSave={onSave}
          onCancel={hideSettingsEditor}
          modal
          t={t}
        />
      </div>
    )
  }
}
