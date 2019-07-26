// @flow
import React from 'react'
import MapMakerStore from '../../stores/MapMakerStore'
import MapMakerActions from '../../actions/MapMakerActions'
import MapHubsComponent from '../MapHubsComponent'
import CodeEditor from '../LayerDesigner/CodeEditor'
import type {MapMakerStoreState} from '../../stores/MapMakerStore'
import { Icon, Tooltip } from 'antd'

type Props = {

}

export default class MapSettingsPanel extends MapHubsComponent<Props, MapMakerStoreState> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.stores.push(MapMakerStore)
  }

  onSave = (settings: string) => {
    settings = JSON.parse(settings)
    MapMakerActions.setSettings(settings)
  }

  showSettingsEditor = () => {
    this.refs.settingsEditor.show()
  }

  render () {
    const {t} = this
    return (
      <div>
        <Tooltip title={t('Advanced Map Settings')} placement='right'>
          <Icon type='setting' style={{fontSize: '24px', marginTop: '4px'}} onClick={this.showSettingsEditor} />
        </Tooltip>

        <CodeEditor ref='settingsEditor' id='map-settings-editor' mode='json'
          code={JSON.stringify(this.state.settings, undefined, 2)}
          title={t('Advanced Map Settings')}
          onSave={this.onSave} modal />
      </div>
    )
  }
}
