//@flow
import React from 'react';
import LayerDesigner from './LayerDesigner';
import OpacityChooser from './OpacityChooser';
import mapStyles from '../Map/styles';
import urlUtil from '../../services/url-util';
import MapHubsComponent from '../MapHubsComponent';

export default class MapLayerDesigner extends MapHubsComponent {

  props: {
    id: string,
    layer: Object,
    onStyleChange: Function,
    onClose: Function,
    showAdvanced: boolean
  }

  static defaultProps = {
    id: 'map-layer-designer',
    showAdvanced: true
  }

  constructor(props: Object) {
    super(props);
    let mapColor = '#FF0000';
    if(props.layer && props.layer.settings && props.layer.settings.color){
      mapColor = props.layer.settings.color;
    }
    this.state = {
      mapColor,
      rasterOpacity: 100,
      layer: props.layer ? props.layer : null
    };
  }

  componentWillReceiveProps(nextProps: Object){
    if(nextProps.layer){
      this.setState({layer: nextProps.layer});
    }
  }

  setColor = (color: string, settings: Object) => {
    //var sourceConfig = this.getSourceConfig();
    var style = mapStyles.updateStyleColor(this.state.layer.style, color);
    var legend = mapStyles.legendWithColor(this.state.layer, color);
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
    var style; 
    if(this.state.layer.external_layer_config.type === 'ags-mapserver-tiles'){
      style = mapStyles.rasterStyleWithOpacity(this.state.layer.layer_id, this.state.layer.external_layer_config.url + '?f=json', opacity, 'arcgisraster');
    }else if(this.state.layer.external_layer_config.type === 'multiraster'){
      style = mapStyles.multiRasterStyleWithOpacity(this.state.layer.layer_id, this.state.layer.external_layer_config.layers, opacity, 'raster');
    }else{
      style = mapStyles.rasterStyleWithOpacity(this.state.layer.layer_id, baseUrl + '/api/layer/' + this.state.layer.layer_id +'/tile.json', opacity);
    }

    var legend = mapStyles.rasterLegend(this.state.layer);
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
    var style = this.state.layer.style; 
    var legendCode = this.state.layer.legend_html;
  
    var designer = '';
    if(this.state.layer){
      if(this.state.layer.is_external
        && (
          this.state.layer.external_layer_config.type === 'raster'
        || this.state.layer.external_layer_config.type === 'multiraster'
        || this.state.layer.external_layer_config.type === 'ags-mapserver-tiles')) {
        designer = (
          <div style={{padding:'5px'}}>
             <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity}
            style={style} onStyleChange={this.setStyle}
            layer={this.state.layer}
            settings={this.state.layer.settings} onSettingsChange={this.setSettings}
            legendCode={legendCode} onLegendChange={this.setLegend} showAdvanced/>
          </div>
        );
      }else if(this.state.layer.is_external
        && this.state.layer.external_layer_config.type === 'mapbox-style'){
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