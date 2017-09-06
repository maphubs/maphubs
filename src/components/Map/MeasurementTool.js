//@flow
import React from 'react';
import MapHubsComponent from '../MapHubsComponent';
import MapToolButton from './MapToolButton';
var debug = require('../../services/debug')('Map/MeasureArea');
import _area from '@turf/area';
import _lineDistance from '@turf/line-distance';
import _isequal from 'lodash.isequal';
var $ = require('jquery');
var MapboxDraw = {};
if (typeof window !== 'undefined') {
    MapboxDraw = require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js');
}


type Props = {|
  id: string,
  reactMap: Object,
  viewport: Object,
  toggleDragPan: Function,
  closeTool: Function
|}

type State = {
  measurementMessage: string
}

export default class MeasurementTool extends MapHubsComponent<Props, State> {

  props: Props

  state = {
    measurementMessage: ''
  }

  draw: any
  drawControlContainer: any

  componentDidMount(){
    this.startMeasurementTool();
  }

  componentWillUnmount(){
    this.stopMeasurementTool();
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

  startMeasurementTool = () => {
    var _this = this;

    let eventManager, eventContainer;
    if(this.props.reactMap._eventManager){
      eventManager = this.props.reactMap._eventManager;
    }

    if(this.props.reactMap._eventCanvas){
      eventContainer = this.props.reactMap._eventCanvas;
    }

    var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        line_string: true,
        trash: true
    }
    });
    draw.setEventManager(eventManager, eventContainer, ()=>{
      return this.props.viewport;
    },
    (dragPan)=>{
      _this.props.toggleDragPan(dragPan);
    },
    (cursor) =>{
      //optionally override the default cursor choices
      //To do so, set the pointer style on eventContainer
    }
    );
    this.draw = draw;
   // $('.mapboxgl-ctrl-top-right').addClass('mapboxgl-ctrl-maphubs-measure-tool');
    $('.map-search-button').addClass('maphubs-measure-tool-search-button');

    let map = this.props.reactMap.getMap();

    this.drawControlContainer = draw.onAdd(map);
    document.getElementById(`map-measurement-tool-${this.props.id}`).appendChild(this.drawControlContainer);

    map.on('draw.create', () => {
      debug.log('draw create');
      _this.updateMeasurement();
    });

    map.on('draw.update', () => {
      debug.log('draw update');
      _this.updateMeasurement();
    });

     map.on('draw.delete', () => {
       debug.log('draw delete');
       _this.setState({measurementMessage: this.__('Use the drawing tools above')});
    });

    this.setState({
      measurementMessage: this.__('Use the drawing tools above')
    });
  }

  stopMeasurementTool = () => {   
    //$('.mapboxgl-ctrl-top-right').removeClass('mapboxgl-ctrl-maphubs-measure-tool');
    $('.map-search-button').removeClass('maphubs-measure-tool-search-button');
    this.draw.onRemove();
    this.setState({
      measurementMessage: ''
    });
    
    this.props.closeTool();
  }

  updateMeasurement = () => {
    var data = this.draw.getAll();
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
        this.setState({measurementMessage: areaMessage}); 
      }else if(lines.features.length > 0){
        var distanceKm = 0;
        lines.features.forEach((linestring) => {
          distanceKm += _lineDistance(linestring);
        });
          var distanceMiles = distanceKm * 0.621371;
        var distanceMessage= 'Total distance: ' + distanceKm.toLocaleString() + 'km ' + distanceMiles.toLocaleString() + 'mi';
        this.setState({measurementMessage: distanceMessage}); 
      }
     
    } 
  }


  render(){  
    return (
      <div>
        <div id={`map-measurement-tool-${this.props.id}`}
        style={{
          position: 'absolute',
          right: '155px',
          top: '-20px', 
          transform: 'rotate(-90deg)'
        }}
        />
        <div style={{
          position: 'absolute',
          top: '46px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: '#FFF',
          height:'30px',
          paddingLeft: '5px',
          paddingRight: '5px',
          borderRadius: '4px',
          zIndex: '100',
          lineHeight: '30px'
        }}>
          <span>{this.state.measurementMessage}</span>
        </div>
        <MapToolButton  top="80px" right="10px" icon="close" show={true} color="#000"
          onClick={this.props.closeTool} tooltipText={this.__('Exit Measurement')} />
      </div>  
    );
  }
}