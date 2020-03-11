// @flow
import React from 'react'
import MapMakerStore from '../../stores/MapMakerStore'
import MapMakerActions from '../../actions/MapMakerActions'
import MapHubsComponent from '../MapHubsComponent'
import type {MapMakerStoreState} from '../../stores/MapMakerStore'
import { SettingOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('../LayerDesigner/CodeEditor'), {
  ssr: false
})

type Props = {

}

type State = {
  showSettingsEditor?: boolean
} & MapMakerStoreState

export default class MapSettingsPanel extends MapHubsComponent<Props, State> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.stores.push(MapMakerStore)
  }

  onSave = (settings: string) => {
    settings = JSON.parse(settings)
    MapMakerActions.setSettings(settings)
    this.setState({showSettingsEditor: false})
  }

  showSettingsEditor = () => {
    this.setState({showSettingsEditor: true})
  }

  hideSettingsEditor = () => {
    this.setState({showSettingsEditor: false})
  }

  render () {
    const {t} = this
    const { showSettingsEditor, settings } = this.state
    return (
      <div>
        <Tooltip title={t('Advanced Map Settings')} placement='right'>
          <SettingOutlined
            style={{fontSize: '24px', marginTop: '4px'}}
            onClick={this.showSettingsEditor}
          />
        </Tooltip>

        <CodeEditor
          id='map-settings-editor' mode='json'
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
