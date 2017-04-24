//@flow
import React from 'react';
import Formsy from 'formsy-react';
import TextInput from '../forms/textInput';
import PresetActions from '../../actions/presetActions';
import LayerActions from '../../actions/LayerActions';
import NotificationActions from '../../actions/NotificationActions';
import MessageActions from '../../actions/MessageActions';
import LayerStore from '../../stores/layer-store';
import MapHubsComponent from '../MapHubsComponent';

export default class RasterTileSource extends MapHubsComponent {

   props: {
    onSubmit: Function,
    showPrev: boolean,
    onPrev: Function
  }

  state = {
    canSubmit: false
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
  }

  componentWillMount(){
    super.componentWillMount();
    Formsy.addValidationRule('isHttps', function (values, value) {
        return value.startsWith('https://');
    });
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

  submit = (model: Object) => {
    var _this = this;
    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Raster Tile Service',
      external_layer_config: {
        type: 'raster',
        tiles: [model.rasterTileUrl]
      }
    }, _this.state._csrf, function(err){
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer.layer_id);
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

  sourceChange = (value: string) => {
    this.setState({selectedSource: value});
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

		return (
        <div className="row">
          <Formsy.Form onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
            <div>
              <p>Raster Tile Source</p>
            <div className="row">
              <TextInput name="rasterTileUrl" label={this.__('Raster Tile URL')} icon="info" className="col s12" validations="maxLength:500,isHttps" validationErrors={{
                     maxLength: this.__('Must be 500 characters or less.'),
                     isHttps:  this.__('SSL required for external links, URLs must start with https://')
                 }} length={500}
                 dataPosition="top" dataTooltip={this.__('Raster URL for example:') +'http://myserver/tiles/{z}/{x}/{y}.png'}
                 required/>
            </div>
            </div>

            {prevButton}
            <div className="right">
              <button type="submit" className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          </Formsy.Form>
      </div>
		);
	}
}