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
  onSubmit: Function,
  showPrev: boolean,
  onPrev: Function
|}

type State = {
  canSubmit: boolean,
  selectedOption: string,
  selectedSceneOption: string
} & LocaleStoreState & LayerStoreState;


export default class PlanetLabsSource extends MapHubsComponent<Props, State> {

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

  componentWillMount(){
    super.componentWillMount();

  /*
    Formsy.addValidationRule('isNotRapidEye', (values, value) => {
        if(value){
          return !value.startsWith('REOrthoTile');
        }else{
          return false;
        }
        
    });

    Formsy.addValidationRule('isNotOrtho', (values, value) => {
      if(value){
        return !value.startsWith('PSOrthoTile');
      }else{
          return false;
      }
    });

    Formsy.addValidationRule('isNotSentinel', (values, value) => {
      if(value){
        return !value.startsWith('Sentinel2L1C');
      }else{
        return false;
      }
    });
      */
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

    var selectedArr = selected.split(':');
    var selectedType = selectedArr[0].trim();
    var selectedScene = selectedArr[1].trim();

    //build planet labs API URL
    //v0 https://tiles.planet.com/v0/scenes/ortho/20160909_175231_0c75/{z}/{x}/{y}.png?api_key=your-api-key
    //v1 https://tiles.planet.com/data/v1/PSScene3Band/20161221_024131_0e19/14/12915/8124.png?api_key=your-api-key
    var url = `https://tiles.planet.com/data/v1/${selectedType}/${selectedScene}/{z}/{x}/{y}.png?api_key=${MAPHUBS_CONFIG.PLANET_LABS_API_KEY}`;
    return url;
  }

  submit = (model: Object) => {
    var _this = this;
    var layers = [];

    var selectedIDs = model.selectedIDs;

    var selectedIDArr = selectedIDs.split(',');

    selectedIDArr.forEach(selected => {
      var url = _this.getAPIUrl(selected);
      layers.push({
        planet_labs_scene: selected,
        tiles: [url]
      });
    });

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Planet',
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

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {
    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }

    /*
    validations={{isNotRapidEye:true, isNotSentinel:true, isNotOrtho:true}} validationErrors={{
                   isNotRapidEye: this.__('RapidEye Not Supported: We are currently researching an issue with the RapidEye API, and hope to restore support at a later date.'),
                   isNotOrtho: this.__('Ortho Not Supported: Try a 3-band or 4-band scene instead. We are investigating an issue with the Planet API support for Ortho scenes.'),
                   isNotSentinel: this.__('Sentinel 2 tiles are not yet supported by the Planet API')
                  }}
    */

		return (
        <div className="row">
          <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
             <div>
              <p>{this.__('Paste the selected IDs from the Planet Explorer API box')}</p>
              <div className="row">
                <TextArea name="selectedIDs" label={this.__('Planet Explorer Selected IDs')}
                  length={2000}
                  
                  icon="info" className="col s12"required/>
              </div>
            </div>
            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          </Formsy>

      </div>
		);
	}
}