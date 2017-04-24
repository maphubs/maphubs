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

    var boundsArr = model.bounds.split(',');
    boundsArr.map(function(item){
      return item.trim();
    });

    LayerActions.saveDataSettings({
      is_external: true,
      external_layer_type: 'Vector Tile Service',
      external_layer_config: {
        type: 'vector',
        minzoom: model.minzoom,
        maxzoom: model.maxzoom,
        bounds: boundsArr,
        tiles: [model.vectorTileUrl]
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

  sourceChange = (value) => {
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
              <p>{this.__('Vector Tile Source')}</p>
            <div className="row">
              <TextInput name="vectorTileUrl" label={this.__('Vector Tile URL')} icon="info" className="col s12" validations="maxLength:500,isHttps" validationErrors={{
                     maxLength: this.__('Must be 500 characters or less.'),
                     isHttps:  this.__('SSL required for external links, URLs must start with https://')
                 }} length={500}
                 dataPosition="top" dataTooltip={this.__('Vector Tile URL for example:') +'http://myserver/tiles/{z}/{x}/{y}.pbf'}
                 required/>
            </div>
            <div className="row">
              <TextInput name="minzoom" label={this.__('MinZoom')} icon="info" className="col s12" 
                 dataPosition="top" dataTooltip={this.__('Lowest tile zoom level available in data')}
                 required/>
            </div>
            <div className="row">
              <TextInput name="maxzoom" label={this.__('MaxZoom')} icon="info" className="col s12" 
                 dataPosition="top" dataTooltip={this.__('Highest tile zoom level available in data')}
                 required/>
            </div>
            <div className="row">
              <TextInput name="bounds" label={this.__('Bounds')} icon="info" className="col s12" 
                 dataPosition="top" dataTooltip={this.__('Comma delimited WGS84 coordinates for extent of the data: minx, miny, maxx, maxy')}
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