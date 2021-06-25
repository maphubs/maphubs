import type { Element } from 'React'
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
type Props = {}
type State = {
  showSettingsEditor?: boolean
} & MapMakerStoreState
export default class MapSettingsPanel extends React.Component<Props, State> {
  props: Props

  constructor(props: Props) {
    super(props)
    this.stores.push(MapMakerStore)
  }

  onSave: any | ((settings: string) => void) = (settings: string) => {
    settings = JSON.parse(settings)
    MapMakerActions.setSettings(settings)
    this.setState({
      showSettingsEditor: false
    })
  }
  showSettingsEditor: any | (() => void) = () => {
    this.setState({
      showSettingsEditor: true
    })
  }
  hideSettingsEditor: any | (() => void) = () => {
    this.setState({
      showSettingsEditor: false
    })
  }

  render(): Element<'div'> {
    const { t } = this
    const { showSettingsEditor, settings } = this.state
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
          onSave={this.onSave}
          onCancel={this.hideSettingsEditor}
          modal
          t={t}
        />
      </div>
    )
  }
}
