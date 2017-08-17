//@flow
import React from 'react';
import MapMakerStore from '../../stores/MapMakerStore';
import MapMakerActions from '../../actions/MapMakerActions';
import MapHubsComponent from '../MapHubsComponent';
import CodeEditor from '../LayerDesigner/CodeEditor';

type Props = {

}

import type {MapMakerStoreState} from '../../stores/MapMakerStore';

export default class MapSettingsPanel extends MapHubsComponent<Props, MapMakerStoreState> {

  props: Props

  constructor(props: Props){
    super(props);
    this.stores.push(MapMakerStore);
  }


  onSave = (settings: string) => {
    settings = JSON.parse(settings);
    MapMakerActions.setSettings(settings);
  }

  showSettingsEditor = () => {
    this.refs.settingsEditor.show();
  }

  render(){

    return (
      <div>
        <button onClick={this.showSettingsEditor} className="btn" style={{margin: '10px'}}>{this.__('Advanced Settings')}</button>
            
        <CodeEditor ref="settingsEditor" id="map-settings-editor" mode="json"
          code={JSON.stringify(this.state.settings, undefined, 2)} 
          title={this.__('Advanced Map Settings')}
          onSave={this.onSave} modal={true}/>
      </div>
    );

  }
}