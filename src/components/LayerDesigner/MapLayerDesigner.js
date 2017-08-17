//@flow
import React from 'react';
import LayerDesigner from './LayerDesigner';
import OpacityChooser from './OpacityChooser';
import MapStyles from '../Map/Styles';
import urlUtil from '../../services/url-util';
import MapHubsComponent from '../MapHubsComponent';
import _isequal from 'lodash.isequal';
import type {Layer} from '../../stores/layer-store';
import type {GLStyle} from '../../types/mapbox-gl-style';

type Props = {|
 id: string,
  layer: Layer,
  onStyleChange: Function,
  onClose: Function,
  showAdvanced: boolean
|}

type DefaultProps = {
  id: string,
  showAdvanced: boolean
}

type State = {
  rasterOpacity: number
}

export default class MapLayerDesigner extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    id: 'map-layer-designer',
    showAdvanced: true
  }

  constructor(props: Props) {
    super(props);
    let style, legend;
    if(props.layer && props.layer.style){
      style = props.layer.style;
    }
    if(props.layer && props.layer.legend_html){
      legend = props.layer.legend_html;
    }
    this.state = {
      style,
      rasterOpacity: 100,
      layer: props.layer,
      legend
    };
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  getSourceConfig = () => {
    var sourceConfig = {
      type: 'vector'
    };
    if(this.props.layer.is_external){
      sourceConfig = this.props.layer.external_layer_config;
    }
    return sourceConfig;
  }

  setRasterOpacity = (opacity: number) => {
    var baseUrl = urlUtil.getBaseUrl();
    let layer_id = this.props.layer.layer_id ? this.props.layer.layer_id : 0;
    var style; 
    let elc = this.props.layer.external_layer_config;
    if(elc && elc.type === 'ags-mapserver-tiles'){
      let url = elc.url? elc.url : '';
      style = MapStyles.raster.rasterStyleWithOpacity(this.props.layer.layer_id, url + '?f=json', opacity, 'arcgisraster');
    }else if(elc && elc.type === 'multiraster'){
      style = MapStyles.raster.multiRasterStyleWithOpacity(this.props.layer.layer_id, elc.layers, opacity, 'raster');
    }else{
      style = MapStyles.raster.rasterStyleWithOpacity(this.props.layer.layer_id, baseUrl + '/api/layer/' + layer_id +'/tile.json', opacity);
    }

    //TODO: add legend placeholders for color opacity value?
    //var legend = MapStyles.legend.rasterLegend(this.props.layer);
    this.props.onStyleChange(this.props.layer.layer_id, style, this.props.layer.labels, this.props.layer.legend_html);
    this.setState({rasterOpacity: opacity});
  }

   onColorChange = (style: GLStyle, legend: string) => {
    this.props.onStyleChange(this.props.layer.layer_id, style, this.props.layer.labels, legend);
  }

  setStyle = (style: GLStyle) => {
    this.props.onStyleChange(this.props.layer.layer_id, style, this.props.layer.labels, this.props.layer.legend_html);
  }

  setLabels = (style: GLStyle, labels: Object) => {
   this.props.onStyleChange(this.props.layer.layer_id, style, labels, this.props.layer.legend_html);
  }

  setMarkers = (style: GLStyle) => {
    this.props.onStyleChange(this.props.layer.layer_id, style, this.props.layer.labels, this.props.layer.legend_html);
  }

  setLegend = (legend: string) => {
    this.props.onStyleChange(this.props.layer.layer_id, this.props.layer.style, this.props.layer.labels, legend);
  }

  close = () => {
    this.props.onClose();
  }

  render(){
    let legendCode: string = (this.props.layer && this.props.layer.legend_html) ? this.props.layer.legend_html : '';
    let style = (this.props.layer && this.props.layer.style) ? this.props.layer.style : undefined;

    let elc = this.props.layer.external_layer_config;
  
    var designer = '';
    if(this.props.layer){
      if(this.props.layer.is_external && elc
        && (
          elc.type === 'raster' ||
          elc.type === 'multiraster' ||
          elc.type === 'ags-mapserver-tiles')) {
        designer = (
          <div style={{padding:'5px'}}>
             <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
            style={style} onStyleChange={this.setStyle}
            layer={this.props.layer}       
            legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced/>
          </div>
        );
      }else if(this.props.layer.is_external && elc
        && elc.type === 'mapbox-style'){
         designer = (
           <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
              <p>{this.__('Unable to change this layer')}</p>
           </div>
         );
      }else {
       designer = (
        <div>
            <LayerDesigner onColorChange={this.onColorChange}
              style={style} onStyleChange={this.setStyle}
              labels={this.props.layer.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setMarkers}
              layer={this.props.layer}
              showAdvanced={this.props.showAdvanced}
              legend={legendCode} onLegendChange={this.setLegend}/>
        </div>
      );
    }
  }
  /*
  var style = {};
  if(this.state.show){
    style.display = 'block';
  }else{
    style.display = 'none';
  }
  */

  return (
    <div>
      <div>
        {designer}
      </div>
      <div>
        <div className="center" style={{margin: '10px'}}>
          <a className="waves-effect waves-light btn" style={{float: 'none'}} onClick={this.close}>{this.__('Close')}</a>
        </div>
      </div>
    </div>
  );
}
}