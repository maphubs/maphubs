//@flow
const debug = require('../../../services/debug')('Map/MeasureArea');
import _area from '@turf/area';
import _lineDistance from '@turf/line-distance';
const $ = require('jquery');
let MapboxDraw = {};
if (typeof window !== 'undefined') {
    MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js');
}

module.exports = {

  toggleMeasurementTools(enable: boolean){
    if(enable && !this.state.enableMeasurementTools){
      //start
      this.startMeasurementTool();
    }else if(this.state.enableMeasurementTools && !enable){
      //stop
      this.stopMeasurementTool();
    }
  },

  startMeasurementTool(){
    const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        line_string: true,
        trash: true
    }
    });
    this.draw = draw;
    $('.mapboxgl-ctrl-top-right').addClass('mapboxgl-ctrl-maphubs-measure-tool');
    $('.map-search-button').addClass('maphubs-measure-tool-search-button');
    this.map.addControl(draw, 'top-right');

    this.map.on('draw.create', (e) => {
      debug.log('draw create');
      this.updateMeasurement(e);
    });

    this.map.on('draw.update', (e) => {
      debug.log('draw update');
      this.updateMeasurement(e);
    });

     this.map.on('draw.delete', () => {
       debug.log('draw delete');
       this.setState({measurementMessage: this.__('Use the drawing tools above')});
    });

    this.setState({enableMeasurementTools: true, 
      measurementMessage: this.__('Use the drawing tools above')
    });
  },

  stopMeasurementTool(){   
    $('.mapboxgl-ctrl-top-right').removeClass('mapboxgl-ctrl-maphubs-measure-tool');
    $('.map-search-button').removeClass('maphubs-measure-tool-search-button');
    this.map.removeControl(this.draw);
    this.setState({
      enableMeasurementTools: false, 
      measurementMessage: ''
    });
  },

  updateMeasurement(){
    const data = this.draw.getAll();
    if (data.features.length > 0) {
      const lines = {
        "type": "FeatureCollection",
        "features": []
      };
        const polygons = {
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
        const area = _area(polygons);
        // restrict to area to 2 decimal points
        const areaM2 = Math.round(area*100)/100;
        const areaKM2 = area * 0.000001;
        const areaHA = areaM2 / 10000.00;

        let areaMessage = this.__('Total area: ');

        if(areaM2 < 1000){
          areaMessage = areaMessage + areaM2.toLocaleString() + 'm2 ';
        }else{
          areaMessage = areaMessage + areaKM2.toLocaleString() + 'km2 ';
        }
        areaMessage = areaMessage + areaHA.toLocaleString() + 'ha';
        this.setState({measurementMessage: areaMessage}); 
      }else if(lines.features.length > 0){
        let distanceKm = 0;
        lines.features.forEach((linestring) => {
          distanceKm += _lineDistance(linestring);
        });
          const distanceMiles = distanceKm * 0.621371;
        const distanceMessage= 'Total distance: ' + distanceKm.toLocaleString() + 'km ' + distanceMiles.toLocaleString() + 'mi';
        this.setState({measurementMessage: distanceMessage}); 
      }
     
    } 
  }
};