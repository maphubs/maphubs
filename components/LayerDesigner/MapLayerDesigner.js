var React = require('react');
var LayerDesigner = require('./LayerDesigner');
var OpacityChooser = require('./OpacityChooser');
var mapStyles = require('../Map/styles');
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var MapLayerDesigner = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    id: React.PropTypes.string,
    layer: React.PropTypes.object,
    onStyleChange: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func.isRequired,
    showAdvanced: React.PropTypes.bool
  },

  getDefaultProps(){
    return {
      id: 'map-layer-designer',
      showAdvanced: false
    };
  },

  getInitialState() {
    return {
      mapColor: '#FF0000',
      rasterOpacity: 100,
      layer: this.props.layer ? this.props.layer : null
    };
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.layer){
      this.setState({layer: nextProps.layer});
    }
  },

  setColor(color){
    //var sourceConfig = this.getSourceConfig();

    var style = mapStyles.updateStyleColor(this.state.layer.style, color);
    var legend = mapStyles.legendWithColor(this.state.layer, color);
    this.props.onStyleChange(this.state.layer.layer_id, style, legend);
    this.setState({style, legend, mapColor: color});
  },

  getSourceConfig(){
    var sourceConfig = {
      type: 'vector'
    };
    if(this.state.layer.is_external){
      sourceConfig = this.state.layer.external_layer_config;
    }
    return sourceConfig;
  },

  setRasterOpacity(opacity){
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    var style = mapStyles.rasterStyleWithOpacity(this.state.layer.layer_id, baseUrl + '/api/layer/' + this.state.layer.layer_id +'/tile.json', opacity);

    if(this.state.layer.external_layer_config.type == 'ags-mapserver-tiles'){
      style = mapStyles.rasterStyleWithOpacity(this.state.layer.layer_id, this.state.layer.external_layer_config.url + '?f=json', opacity, 'arcgisraster');
    }

    var legend = mapStyles.rasterLegend(this.state.layer);
    this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, legend);
    this.setState({style, legend, rasterOpacity: opacity});
  },

  setStyle(style){
    this.props.onStyleChange(this.state.layer.layer_id, style, this.state.layer.labels, this.state.layer.legend_html);
    this.setState({style});
  },

  setLabels(style, labels){
   this.props.onStyleChange(this.state.layer.layer_id, style, labels, this.state.layer.legend_html);
  },

  setLegend(legend_html){
    this.props.onStyleChange(this.state.layer.layer_id, this.state.layer.style, this.state.layer.labels, legend_html);
    this.setState({legend: legend_html});
  },

  close(){
    this.props.onClose();
  },

  render(){

    var designer = '';
    if(this.state.layer){
      if(this.state.layer.is_external
        && (
          this.state.layer.external_layer_config.type == 'raster'
        || this.state.layer.external_layer_config.type == 'ags-mapserver-tiles')) {
        designer = (
          <div style={{padding:'5px'}}>
             <OpacityChooser value={this.state.rasterOpacity} onChange={this.setRasterOpacity} 
            style={this.state.layer.style} onStyleChange={this.setStyle} 
            layer={this.state.layer}
            legendCode={this.state.layer.legend_html} onLegendChange={this.setLegend}/>
          </div>
        );
      }else if(this.state.layer.is_external
        && this.state.layer.external_layer_config.type == 'mapbox-style'){
         designer = (
           <div style={{marginTop: '20px', marginBottom: '20px', padding: '20px', border: '1px solid #b1b1b1'}}>
              <p>{this.__('Unable to change this layer')}</p>
           </div>
         );
      }else {
       designer = (
        <div>
            <LayerDesigner color={this.state.mapColor} onColorChange={this.setColor}
              style={this.state.layer.style} onStyleChange={this.setStyle} 
              labels={this.state.layer.labels} onLabelsChange={this.setLabels}
              layer={this.state.layer}
              showAdvanced={this.props.showAdvanced}
              legendCode={this.state.layer.legend_html} onLegendChange={this.setLegend}/>
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
});

module.exports = MapLayerDesigner;
