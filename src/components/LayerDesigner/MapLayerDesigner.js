//@flow
import React from 'react';
import LayerDesigner from './LayerDesigner';
import OpacityChooser from './OpacityChooser';
import MapStyles from '../Map/Styles';
import urlUtil from '../../services/url-util';
import MapHubsComponent from '../MapHubsComponent';

import type {Layer} from '../../stores/layer-store';

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
  mapColor: string,
  rasterOpacity: number,
  layer: Layer,
  style?: Object,
  legend?: string
}

export default class MapLayerDesigner extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    id: 'map-layer-designer',
    showAdvanced: true
  }

  constructor(props: Props) {
    super(props);
    let mapColor: string = '#FF0000';
    let prevColorSetting = MapStyles.settings.get(this.props.layer.style, 'mapColor');
    if(prevColorSetting){
      mapColor = prevColorSetting;
    }
    this.state = {
      mapColor,
      rasterOpacity: 100,
      layer: props.layer
    };
  }

  componentWillReceiveProps(nextProps: Props){
    if(nextProps.layer){
      this.setState({layer: nextProps.layer});
    }
  }

  setColor = (color: string, settings: Object) => {
    //var sourceConfig = this.getSourceConfig();
    var style = MapStyles.color.updateStyleColor(this.state.layer.style, color);
    var legend = MapStyles.legend.legendWithColor(this.state.layer, color);
    this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, legend, settings);
    this.setState({style, legend, mapColor: color});
  }

  getSourceConfig = () => {
    var sourceConfig = {
      type: 'vector'
    };
    if(this.state.layer.is_external){
      sourceConfig = this.state.layer.external_layer_config;
    }
    return sourceConfig;
  }

  setRasterOpacity = (opacity: number) => {
    var baseUrl = urlUtil.getBaseUrl();
    let layer_id = this.state.layer.layer_id ? this.state.layer.layer_id : 0;
    var style; 
    let elc = this.state.layer.external_layer_config;
    if(elc && elc.type === 'ags-mapserver-tiles'){
      let url = elc.url? elc.url : '';
      style = MapStyles.raster.rasterStyleWithOpacity(this.state.layer.layer_id, url + '?f=json', opacity, 'arcgisraster');
    }else if(elc && elc.type === 'multiraster'){
      style = MapStyles.raster.multiRasterStyleWithOpacity(this.state.layer.layer_id, elc.layers, opacity, 'raster');
    }else{
      style = MapStyles.raster.rasterStyleWithOpacity(this.state.layer.layer_id, baseUrl + '/api/layer/' + layer_id +'/tile.json', opacity);
    }

    var legend = MapStyles.legend.rasterLegend(this.state.layer);
    this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, legend, this.state.layer.settings);
    this.setState({style, legend, rasterOpacity: opacity});
  }

  setStyle = (style: Object) => {
    this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, this.state.layer.legend_html, this.state.layer.settings);
    this.setState({style});
  }

  setLabels = (style: Object, labels: Object) => {
   this.props.onStyleChange(this.state.layer.layer_id, style, labels, this.state.layer.legend_html, this.state.layer.settings);
  }

  setMarkers = (style: Object) => {
    this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, this.state.layer.legend_html, this.state.layer.settings);
  }

  setSettings = (style: Object, settings: Object) => {
     this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, this.state.layer.legend_html, settings);
  }

  setLegend = (legend_html: string) => {
    this.props.onStyleChange(this.state.layer.layer_id, this.state.layer.style, this.state.layer.labels, legend_html, this.state.layer.settings);
    this.setState({legend: legend_html});
  }

  close = () => {
    this.props.onClose();
  }

  render(){
    let legendCode: string = this.state.legend? this.state.legend : '';
    let style = this.state.style? this.state.style: {};

    let elc = this.state.layer.external_layer_config;
  
    var designer = '';
    if(this.state.layer){
      if(this.state.layer.is_external && elc
        && (
          elc.type === 'raster' ||
          elc.type === 'multiraster' ||
          elc.type === 'ags-mapserver-tiles')) {
        designer = (
          <div style={{padding:'5px'}}>
             <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
            style={style} onStyleChange={this.setStyle}
            layer={this.state.layer}
            settings={this.state.layer.settings} onSettingsChange={this.setSettings}
            legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced/>
          </div>
        );
      }else if(this.state.layer.is_external && elc
        && elc.type === 'mapbox-style'){
         designer = (
           <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
              <p>{this.__('Unable to change this layer')}</p>
           </div>
         );
      }else {
       designer = (
        <div>
            <LayerDesigner color={this.state.mapColor} onColorChange={this.setColor}
              style={style} onStyleChange={this.setStyle}
              labels={this.state.layer.labels} onLabelsChange={this.setLabels} onMarkersChange={this.setMarkers}
              settings={this.state.layer.settings} onSettingsChange={this.setSettings}
              layer={this.state.layer}
              showAdvanced={this.props.showAdvanced}
              legendCode={legendCode} onLegendChange={this.setLegend}/>
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