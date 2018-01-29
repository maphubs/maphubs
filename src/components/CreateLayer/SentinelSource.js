//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextArea from '../forms/textArea';
import LayerActions from '../../actions/LayerActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import LayerStore from '../../stores/layer-store';
import MapHubsComponent from '../MapHubsComponent';

import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';

type Props = {|
  onSubmit: Function
|}

type State = {
  canSubmit: boolean,
  selectedOption: string,
  selectedSceneOption: string
} & LocaleStoreState & LayerStoreState;


export default class SentinelSource extends MapHubsComponent<Props, State> {

  props: Props

  state: State = {
    canSubmit: false,
    selectedOption: 'scene',
    selectedSceneOption: 'ortho'
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    });
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    });
  }

  getAPIUrl = (selected: string) => {

    const selectedArr = selected.split(':');
    const selectedType = selectedArr[0].trim();
    const selectedScene = selectedArr[1].trim();

    return url;
  }

  submit = (model: Object) => {
    const _this = this;
    const layers = [];

    const selectedIDs = model.selectedIDs;

    const selectedIDArr = selectedIDs.split(',');

    selectedIDArr.forEach(selected => {
      const url = _this.getAPIUrl(selected);
      layers.push({
        sentinel_secene: selected,
        tiles: [url]
      });
    });

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Sentinel',
      external_layer_config: {
        type: 'multiraster',
        layers
      }
      
    }, _this.state._csrf, (err) => {
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        NotificationActions.showNotification({
          message: _this.__('Layer Saved'),
          dismissAfter: 1000,
          onDismiss(){
            //reset style to load correct source
            LayerActions.resetStyle();
            //tell the map that the data is initialized
            LayerActions.tileServiceInitialized();
            _this.props.onSubmit();
          }
        });
      }

    });
  }

  optionChange = (value: string) => {
    this.setState({selectedOption: value});
  }

  sceneOptionChange = (value: string) => {
    this.setState({selectedSceneOption: value});
  }

	render() {
		return (
        <div className="row">
          <p>Coming Soon!</p>
      </div>
		);
	}
}