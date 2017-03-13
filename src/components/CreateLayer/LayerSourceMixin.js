var React = require('react');
var UploadLocalSource = require('./UploadLocalSource');
var EmptyLocalSource = require('./EmptyLocalSource');
var MapboxSource = require('./MapboxSource');
var RasterTileSource = require('./RasterTileSource');
var VectorTileSource = require('./VectorTileSource');
var GeoJSONUrlSource = require('./GeoJSONUrlSource');
//var GithubSource = require('./GithubSource');
var AGOLSource = require('./AGOLSource');
//var OSMSource = require('./OSMSource');
var PlanetLabsSource = require('./PlanetLabsSource');

require('../../stores/preset-store'); //needed to init the store used by the source options


var LayerSourceMixin = {

  getSource(type){
    if(type === 'local'){
      return (<UploadLocalSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'geojson'){
      return(<GeoJSONUrlSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'mapbox'){
      return (<MapboxSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'raster'){
      return(<RasterTileSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'vector'){
      return(<VectorTileSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'ags'){
      return(<AGOLSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'planet'){
      return(<PlanetLabsSource showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else if(type === 'point' || type === 'line' || type === 'polygon'){
      return (<EmptyLocalSource showPrev={true} type={type}
      onPrev={this.onPrev} onSubmit={this.onSubmit} />);
    }else{
      return '';
    }
  }

};

module.exports = LayerSourceMixin;