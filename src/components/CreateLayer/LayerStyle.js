//@flow
import React from 'react';
var $ = require('jquery');
import mapStyles from '../Map/styles';
import Map from '../Map/Map';
import MiniLegend from '../Map/MiniLegend';
import LayerStore from '../../stores/layer-store';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import ConfirmationActions from '../../actions/ConfirmationActions';
import Progress from '../Progress';
import urlUtil from '../../services/url-util';
import OpacityChooser from '../LayerDesigner/OpacityChooser';
import LayerDesigner from '../LayerDesigner/LayerDesigner';
import MapHubsComponent from '../MapHubsComponent';
import Reflux from 'reflux';

export default class LayerStyle extends MapHubsComponent {

  props: {
    onSubmit: Function,
    showPrev: boolean,
    prevText: string,
    onPrev: Function,
    waitForTileInit: boolean
  }

  static defaultProps = {
    onSubmit: null,
    waitForTileInit: false //wait for tile service before showing map
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
    this.state = {      
      rasterOpacity: 100,
      saving: false,
      showMap: !props.waitForTileInit
    };
  }

  componentDidMount() {
    Reflux.listenTo(LayerActions.tileServiceInitialized, 'tileServiceInitialized');
    $('.collapsible').collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  }

  tileServiceInitialized = () => {
    this.setState({showMap: true});
    //this.refs.map.reload();
  }

  onSubmit = () => {
    var _this = this;
    _this.setState({saving: true});
    var preview_position =  this.refs.map.getPosition();
    preview_position.bbox = this.refs.map.getBounds();
    LayerActions.saveStyle({
      layer_id: this.state.layer.layer_id,
      style: this.state.layer.style,
      labels: this.state.layer.labels,
      settings: this.state.layer.settings,
      legend_html: this.state.layer.legend_html,
      preview_position
    },
    this.state._csrf,
    (err) => {
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        if(_this.props.onSubmit) _this.props.onSubmit(_this.state.layer.layer_id, _this.state.layer.name);
      }
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

  //Color must now be a rgba() formatted string
  setColor = (color: string, settings: Object) => {

    var style = mapStyles.updateStyleColor(this.state.layer.style, color);
    var legend = mapStyles.legendWithColor(this.state.layer, color);
    LayerActions.setStyle(style, this.state.layer.labels, legend, settings, null);

  }

  setRasterOpacity = (opacity: number) => {

    var style = null;
    if(this.state.layer.is_external && this.state.layer.external_layer_config.type === 'ags-mapserver-tiles'){
      style = mapStyles.rasterStyleWithOpacity(this.state.layer.layer_id, this.state.layer.external_layer_config.url + '?f=json', opacity, 'arcgisraster');
    }else if(this.state.layer.is_external && this.state.layer.external_layer_config.type === 'multiraster'){
       style = mapStyles.multiRasterStyleWithOpacity(this.state.layer.layer_id, this.state.layer.external_layer_config.layers, opacity, 'raster');
    }
    else{
      var baseUrl = urlUtil.getBaseUrl();
      style = mapStyles.rasterStyleWithOpacity(this.state.layer.layer_id, baseUrl + '/api/layer/' + this.state.layer.layer_id +'/tile.json', opacity);
    }

    var legend = mapStyles.rasterLegend(this.state.layer);
    LayerActions.setStyle(style,  this.state.layer.labels, legend, this.state.layer.settings, this.state.layer.preview_position);
    this.setState({rasterOpacity: opacity});
  }

  setStyle = (style: Object) => {
    LayerActions.setStyle(style, this.state.layer.labels, this.state.layer.legend_html, this.state.layer.settings, this.state.layer.preview_position);
  }

  setLabels = (style: Object, labels: Object) => {
    LayerActions.setStyle(style, labels, this.state.layer.legend_html, this.state.layer.settings, this.state.layer.preview_position);
  }

  setMarkers = (style: Object) => {
    LayerActions.setStyle(style, this.state.layer.labels, this.state.layer.legend_html, this.state.layer.settings, this.state.layer.preview_position);
  }

  setSettings = (style: Object, settings: Object) => {
    LayerActions.setStyle(style, this.state.layer.labels, this.state.layer.legend_html, settings, this.state.layer.preview_position);
  }

  setLegend = (legend_html: string) => {
    LayerActions.setStyle(this.state.layer.style, this.state.layer.labels, legend_html, this.state.layer.settings, this.state.layer.preview_position);
  }

  reloadMap = () => {
    this.refs.map.reload();
  }

  resetStyle = () => {

    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Reset'),
      postitiveButtonText: this.__('Reset'),
      negativeButtonText: this.__('Cancel'),
      message: this.__('Warning! This will permanently delete all custom style settings from this layer.'),
      onPositiveResponse(){
        LayerActions.resetStyle();
      }
    });
  }

	render() {

    var mapExtent = null;
    if(this.state.layer.preview_position && this.state.layer.preview_position.bbox){
      var bbox = this.state.layer.preview_position.bbox;
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
    }

    var map = '';
    if(this.state.layer.layer_id !== undefined
      && this.state.layer.layer_id !== -1
      && this.state.showMap){
        map = (
          <div>
            <Map ref="map" id="layer-style-map" className="z-depth-2" insetMap={false} style={{height: '300px', width: '400px', margin: 'auto'}}
              glStyle={this.state.layer.style}
              showLogo={false}
              fitBounds={mapExtent}
              />
            <MiniLegend style={{height: 'calc(100% - 300px)', width: '400px', margin: 'auto', overflow: 'auto'}}
                collapsible={true} hideInactive={false} showLayersButton={false}
                layers={[this.state.layer]}/>
          </div>
        );
    }


    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.props.prevText}</a>
        </div>
      );
    }

    var colorChooser = '';
    if(this.state.layer.is_external
      && (this.state.layer.external_layer_config.type === 'raster'
      || this.state.layer.external_layer_config.type === 'multiraster'
      || this.state.layer.external_layer_config.type === 'ags-mapserver-tiles')) {
      colorChooser = (
        <div>
          <h5>{this.__('Choose Style')}</h5>
          <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
            style={this.state.layer.style} onStyleChange={this.setStyle}
            layer={this.state.layer}
            legendCode={this.state.layer.legend_html} onLegendChange={this.setLegend} showAdvanced/>
        </div>
      );
    }else if(this.state.layer.is_external && this.state.layer.external_layer_config.type === 'mapbox-style') {
       colorChooser = (
         <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
            <b>{this.__('Mapbox Studio Style Layer')}</b>
            <p>{this.__('If you are the owner of this layer, click here to edit in Mapbox Studio on mapbox.com')}</p>
            <a target="_blank" className="btn" href={'https://www.mapbox.com/studio/styles/' + this.state.layer.external_layer_config.mapboxid + '/edit'}>{this.__('Edit in Mapbox Studio')}</a>
            <p>{this.__('Once you have published your style on Mapbox,click refresh the preview map.')}
            <b>{this.__('It may take a few minutes for the changes to appear, your layer will update automatically.')}</b>
            </p>
            <button onClick={this.reloadMap} className="waves-effect waves-light btn">{this.__('Reload')}</button>
         </div>
       );
    }else {
     colorChooser = (
      <div>
        <h5>{this.__('Choose Style')}</h5>
          <LayerDesigner color={this.state.mapColor} onColorChange={this.setColor}
            style={this.state.layer.style} onStyleChange={this.setStyle}
            labels={this.state.layer.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setMarkers}
            settings={this.state.layer.settings} onSettingsChange={this.setSettings}
            layer={this.state.layer}
            legendCode={this.state.layer.legend_html} onLegendChange={this.setLegend}/>
      </div>
    );
  }

		return (
      <div>
          <Progress id="save-style-progess" title={this.__('Saving map')} subTitle="" dismissible={false} show={this.state.saving}/>
        <div className="row">

               <div className="row center">
                 <div className="col s12 m6 l6">
                   <h5>{this.__('Choose Preview')}</h5>
                   {map}
                   <p>{this.__('The map preview is how your map will look in search results and other listings.')}</p>
                 </div>
                 <div className="col s12 m6 l6" style={{width: '425px'}}>
                   {colorChooser}
                   <div className="right">
                     <button onClick={this.resetStyle} style={{marginRight: '10px'}} className="waves-effect waves-light btn">{this.__('Reset')}</button>
                     <button onClick={this.onSubmit} className="waves-effect waves-light btn">{this.__('Save')}</button>
                   </div>
                </div>
               </div>

            {prevButton}

          </div>
      </div>
		);
	}
}