//@flow
import React from 'react';
var $ = require('jquery');
import MapStyles from '../Map/Styles';
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
//import Reflux from 'reflux';

import type {LayerStoreState} from '../../stores/layer-store';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {GLStyle} from '../../types/mapbox-gl-style';

type Props = {|
  onSubmit: Function,
  showPrev?: boolean,
  prevText?: string,
  onPrev?: Function,
  mapConfig: Object,
  waitForTileInit: boolean
|}

type DefaultProps = {
  waitForTileInit: boolean
}

type State = {
  rasterOpacity: number,
  saving: boolean
} & LayerStoreState & LocaleStoreState

export default class LayerStyle extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    waitForTileInit: false //wait for tile service before showing map
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
    this.state = {      
      rasterOpacity: 100,
      saving: false
    };
  }

  componentDidMount() {
    $('.collapsible').collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
  }

  onSubmit = () => {
    var _this = this;
    _this.setState({saving: true});
    var preview_position =  this.refs.map.getPosition();
    preview_position.bbox = this.refs.map.getBounds();
    LayerActions.saveStyle({
      layer_id: this.state.layer_id,
      style: this.state.style,
      labels: this.state.labels,
      legend_html: this.state.legend_html,
      preview_position
    },
    this.state._csrf,
    (err) => {
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        _this.props.onSubmit(_this.state.layer_id, _this.state.name);
      }
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

  setRasterOpacity = (opacity: number) => {
    let elc = this.state.external_layer_config? this.state.external_layer_config: {};
    let layer_id = this.state.layer_id ? this.state.layer_id: 0;
    var style = null;
    if(this.state.is_external && elc.type === 'ags-mapserver-tiles' && elc.url){
      style = MapStyles.raster.rasterStyleWithOpacity(layer_id, this.state.shortid, elc.url + '?f=json', opacity, 'arcgisraster');
    }else if(this.state.is_external && elc.type === 'multiraster' && elc.layers){
       style = MapStyles.raster.multiRasterStyleWithOpacity(layer_id, this.state.shortid, elc.layers, opacity, 'raster');
    }
    else{
      const baseUrl = urlUtil.getBaseUrl();
      style = MapStyles.raster.rasterStyleWithOpacity(layer_id, this.state.shortid, `${baseUrl}/api/lyr/${this.state.shortid}/tile.json`, opacity);
    }

    const legend_html = MapStyles.legend.rasterLegend(this.state);
    LayerActions.setStyle({style, legend_html});
    this.setState({rasterOpacity: opacity});
  }

  onColorChange = (style: GLStyle, legend_html: string) => {
    LayerActions.setStyle({style, legend_html});
  }

  setStyle = (style: GLStyle) => {
    LayerActions.setStyle({style});
  }

  setLabels = (style: GLStyle, labels: Object) => {
    LayerActions.setStyle({style, labels});
  }

  setLegend = (legend_html: string) => {
    LayerActions.setStyle({legend_html});
  }

  reloadMap = () => {
    this.refs.map.reloadStyle();
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

    const showMap = this.props.waitForTileInit ? this.state.tileServiceInitialized : true;

    let mapExtent;
    if(this.state.preview_position && this.state.preview_position.bbox){
      var bbox = this.state.preview_position.bbox;
      mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
    }

    var map = '';
    if(this.state.layer_id !== undefined
      && this.state.layer_id !== -1
      && showMap){
        let glStyle;
        if(this.state.style){
          glStyle = this.state.style;
        }
        map = (
          <div>
            <div className="row no-margin">
              <Map ref="map" id="layer-style-map" className="z-depth-2" insetMap={false} style={{height: '300px', width: '400px', margin: 'auto'}}
              glStyle={glStyle}
              showLogo={false}
              mapConfig={this.props.mapConfig}
              fitBounds={mapExtent}
              />
            </div>
            <div className="row" style={{width: '400px', position: 'relative'}}>
              <MiniLegend style={{height: 'auto', width: '400px', margin: 'auto', overflow: 'auto'}}
                collapsible={true} hideInactive={false} showLayersButton={false}
                layers={[this.state]}/>
            </div>  
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

    let externalLayerConfig: Object = this.state.external_layer_config? this.state.external_layer_config: {};
    let legendCode: string = this.state.legend_html? this.state.legend_html : '';
    let style: Object = this.state.style? this.state.style: {};

    var colorChooser = '';
    if(this.state.is_external
      && (externalLayerConfig.type === 'raster'
      || externalLayerConfig.type === 'multiraster'
      || externalLayerConfig.type === 'ags-mapserver-tiles')) {

        
      colorChooser = (
        <div>
          <h5>{this.__('Choose Style')}</h5>
          <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
            style={style} onStyleChange={this.setStyle} onColorChange={this.onColorChange}
            layer={this.state}
            legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced/>
        </div>
      );
    }else if(this.state.is_external && externalLayerConfig.type === 'mapbox-style') {
       colorChooser = (
         <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
            <b>{this.__('Mapbox Studio Style Layer')}</b>
            <p>{this.__('If you are the owner of this layer, click here to edit in Mapbox Studio on mapbox.com')}</p>
            <a target="_blank" rel="noopener noreferrer" className="btn" href={'https://www.mapbox.com/studio/styles/' + externalLayerConfig.mapboxid + '/edit'}>{this.__('Edit in Mapbox Studio')}</a>
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
          <LayerDesigner onColorChange={this.onColorChange}
            style={style} onStyleChange={this.setStyle}
            labels={this.state.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setStyle}
            layer={this.state}
            legend={legendCode} onLegendChange={this.setLegend}/>
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