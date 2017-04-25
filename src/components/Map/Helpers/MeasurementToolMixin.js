
var debug = require('../../../services/debug')('Map/MeasureArea');
import _area from '@turf/area';
import _lineDistance from '@turf/line-distance';
var $ = require('jquery');
var MapboxDraw = {};
if (typeof window !== 'undefined') {
    MapboxDraw = require('../../../../assets/assets/js/mapbox-gl/mapbox-gl-draw.js');
}

export default function() {
  var _this = this;

  this.toggleMeasurementTools = (enable) => {
    if(enable && !_this.state.enableMeasurementTools){
      //start
      _this.startMeasurementTool();
    }else if(_this.state.enableMeasurementTools && !enable){
      //stop
      _this.stopMeasurementTool();
    }
  },

  this.startMeasurementTool = () => {
    var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        line_string: true,
        trash: true
    }
    });
    _this.draw = draw;
    $('.mapboxgl-ctrl-top-right').addClass('mapboxgl-ctrl-maphubs-measure-tool');
    _this.map.addControl(draw, 'top-right');

    _this.map.on('draw.create', (e) => {
      debug('draw create');
      _this.updateMeasurement(e);
    });

    _this.map.on('draw.update', (e) => {
      debug('draw update');
      _this.updateMeasurement(e);
    });

     _this.map.on('draw.delete', () => {
       debug('draw delete');
       _this.setState({measurementMessage: _this.__('Use the drawing tools above')});
    });

    _this.setState({enableMeasurementTools: true, 
      measurementMessage: _this.__('Use the drawing tools above')
    });
  },

  this.stopMeasurementTool = () => {   
    $('.mapboxgl-ctrl-top-right').removeClass('mapboxgl-ctrl-maphubs-measure-tool');
    _this.map.removeControl(_this.draw);
    _this.setState({
      enableMeasurementTools: false, 
      measurementMessage: ''
    });
  },

  this.updateMeasurement = () => {
    var data = _this.draw.getAll();
    if (data.features.length > 0) {
      var lines = {
        "type": "FeatureCollection",
        "features": []
      };
        var polygons = {
          "type": "FeatureCollection",
          "features": []
      };
      data.features.forEach((feature) => {
        if(feature.geometry.type === 'Polygon'){
          polygons.features.push(feature);
        }else if(feature.geometry.type === 'LineString'){
          lines.features.push(feature);
        }
      });
      if(polygons.features.length > 0){
        var area = _area(polygons);
        // restrict to area to 2 decimal points
        var areaM2 = Math.round(area*100)/100;
        var areaKM2 = area * 0.000001;
        var areaHA = areaM2 / 10000.00;

        var areaMessage = this.__('Total area: ');

        if(areaM2 < 1000){
          areaMessage = areaMessage + areaM2.toLocaleString() + 'm2 ';
        }else{
          areaMessage = areaMessage + areaKM2.toLocaleString() + 'km2 ';
        }
        areaMessage = areaMessage + areaHA.toLocaleString() + 'ha';
        _this.setState({measurementMessage: areaMessage}); 
      }else if(lines.features.length > 0){
        var distanceKm = 0;
        lines.features.forEach((linestring) => {
          distanceKm += _lineDistance(linestring);
        });
          var distanceMiles = distanceKm * 0.621371;
        var distanceMessage= 'Total distance: ' + distanceKm.toLocaleString() + 'km ' + distanceMiles.toLocaleString() + 'mi';
        _this.setState({measurementMessage: distanceMessage}); 
      }
     
    } 
  };
}