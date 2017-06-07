var _area = require('@turf/area');

export default function(){
  var _this = this;
  this.getDefaultForestAlertState = () => {
    return {
      enableGLAD2017: false,
      result: null
    };
  };

  //API
  this.toggleForestAlerts = (config) => {
    var forestAlerts;
    if(!_this.state.forestAlerts){
      forestAlerts = this.getDefaultForestAlertState();
    }else{
      forestAlerts = JSON.parse(JSON.stringify(_this.state.forestAlerts)); 
    }

    if(!forestAlerts.enableGLAD2017 && config.enableGLAD2017){
      //layer turning on
      _this.addGLADLayer();
      forestAlerts.enableGLAD2017 = config.enableGLAD2017;
      _this.setState({forestAlerts});
    }else if(forestAlerts.enableGLAD2017 && !config.enableGLAD2017){
      //layer turning off
      _this.removeGLADLayer();
      forestAlerts.enableGLAD2017 = config.enableGLAD2017;
      forestAlerts.result = null;
      _this.setState({forestAlerts});
    }
  };

  /**
   * Used to restore alerts if map is reloaded
   */
  this.restoreForestAlerts = () => {
    if(_this.state.forestAlerts.enableGLAD2017){
      _this.addGLADLayer();
    }
  };

  this.calculateForestAlerts = () => {
    if(!_this.state.forestAlerts.enableGLAD2017){
      return;
    }

    var features = _this.map.queryRenderedFeatures({layers: ['omh-glad-2017-polygon']});

    var alertCount = features.length;

    var area = _area({type: 'FeatureCollection', features});
        // restrict to area to 2 decimal points
        var areaM2 = Math.round(area*100)/100;
        var areaKM2 = area * 0.000001;
        var areaHA = areaM2 / 10000.00;

        var areaMessage = '';

        if(areaM2 < 1000){
          areaMessage = areaMessage + areaM2.toLocaleString() + 'm2 ';
        }else{
          areaMessage = areaMessage + areaKM2.toLocaleString() + 'km2 ';
        }
        areaMessage = areaMessage + areaHA.toLocaleString() + 'ha';

        var forestAlerts = JSON.parse(JSON.stringify(_this.state.forestAlerts)); 
        forestAlerts.result = {alertCount,areaMessage};
          
        _this.setState({forestAlerts}); 

  };

  //helper functions

  this.addGLADLayer = () => {
    //add map source
    _this.map.addSource('omh-glad-2017', {
      "type": "vector",
      "url": "https://s3.amazonaws.com/maphubs-forest-alerts/glad/2017.json"
    });

    //add map layers

    _this.map.addLayer({
      "id": "omh-glad-2017-point",
      "type": "circle",
      "maxzoom": 13,
      "metadata": {
        "maphubs:interactive": false,
        "maphubs:showBehindBaseMapLabels": false
      },
      "source": "omh-glad-2017",
      "paint": {
        "circle-color": "red"
      },
      "source-layer": "data"
    });

    _this.map.addLayer({
      "id": "omh-glad-2017-polygon",
      "type": "fill",
      "maxzoom": 22,
      "metadata": {
        "maphubs:interactive": false,
        "maphubs:showBehindBaseMapLabels": false
      },
      "source": "omh-glad-2017",
      "filter": [
        "in",
        "$type",
        "Polygon"
      ],
      "paint": {
        "fill-color": "red",
        "fill-outline-color": "red",
        "fill-opacity": 0.5
      },
      "source-layer": "data",
      "layout": {
        "visibility": "visible"
      }
    });
     _this.map.addLayer({
      "id": "omh-glad-2017-outline-polygon",
      "type": "line",
      "maxzoom": 22,
      "source": "omh-glad-2017",
      "filter": [
        "in",
        "$type",
        "Polygon"
      ],
      "paint": {
        "line-color": "#222222",
        "line-opacity": 0.8,
        "line-width": {
          "base": 0.5,
          "stops": [
            [
              3,
              0.1
            ],
            [
              4,
              0.2
            ],
            [
              5,
              0.3
            ],
            [
              6,
              0.4
            ],
            [
              7,
              0.5
            ],
            [
              8,
              0.6
            ],
            [
              9,
              0.7
            ],
            [
              10,
              0.8
            ]
          ]
        }
      },  
      "source-layer": "data",
      "layout": {
        "visibility": "visible"
      }
  });
  };

  this.removeGLADLayer = () => {

    _this.map.removeLayer('omh-glad-2017-outline-polygon');
    _this.map.removeLayer('omh-glad-2017-polygon');
    _this.map.removeLayer('omh-glad-2017-point');
    _this.map.removeSource('omh-glad-2017');

  };
}