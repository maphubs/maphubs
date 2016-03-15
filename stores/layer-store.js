var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/LayerActions');
var request = require('superagent');
var mapStyles = require('../components/Map/styles');
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;
var debug = require('../services/debug')('layer-store');
var emptyLayer = require('./empty-layer');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,



  getInitialState() {
    return {
      layer: emptyLayer,
      groups: []
    };
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

  loadLayer(layer){
    this.setState({layer});

    if(!this.state.layer.style){
      this.resetStyleGL();
    }

    if(!this.state.layer.legend_html){
      this.resetLegendHTML();
    }

    this.trigger(this.state);
  },

  resetStyleGL(){
    var layer = this.state.layer;
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    if(layer.is_external && layer.external_layer_type == 'mapbox-map'){
      layer.style = mapStyles.defaultRasterStyle(layer.layer_id, layer.external_layer_config.url);
    }else if(layer.is_external && layer.external_layer_config.type == 'raster'){
      layer.style = mapStyles.defaultRasterStyle(layer.layer_id, baseUrl + '/api/layer/' + this.state.layer.layer_id +'/tile.json');
    }else if(layer.is_external && layer.external_layer_config.type == 'mapbox-style'){
        layer.style = mapStyles.getMapboxStyle(layer.external_layer_config.mapboxid);
    }else if(layer.is_external && layer.external_layer_config.type == 'ags-mapserver-tiles'){
        layer.style = mapStyles.defaultRasterStyle(layer.layer_id, layer.external_layer_config.url + '?f=json', 'arcgisraster');
    }else{
      layer.style = mapStyles.defaultStyle(layer.layer_id, this.getSourceConfig());
    }
    this.setState({layer});
  },

  resetLegendHTML(){
    var layer = this.state.layer;
    if(layer.is_external
      && (layer.external_layer_config.type == 'raster'
          || layer.external_layer_config.type == 'ags-mapserver-tiles')){
      layer.legend_html = mapStyles.rasterLegend(layer);
    }else if(layer.is_external && layer.external_layer_config.type == 'mapbox-style'){
      layer.legend_html = mapStyles.rasterLegend(layer);
    }else{
      layer.legend_html = mapStyles.defaultLegend(layer);
    }
    this.setState({layer});
  },

  resetStyle(){
    this.resetStyleGL();
    this.resetLegendHTML();
    this.trigger(this.state);
  },

  createLayer(data, cb){
    var _this = this;
    var layer = this.state.layer;
    request.post('/api/layer/admin/createLayer')
    .type('json').accept('json')
    .send({
      layer_id: layer.layer_id,
      name: data.name,
      description: data.description,
      group_id: data.group,
      published: data.published
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){

          layer.layer_id = res.body.layer_id;
          layer.name = data.name;
          layer.description = data.description;
          layer.owned_by_group_id = data.group;
          layer.published = data.published;
          layer.style = mapStyles.defaultStyle(layer.layer_id, _this.getSourceConfig()),
          layer.legend_html = mapStyles.defaultLegend(_this.state.layer),
          layer.preview_position = {
            zoom: 1,
            lat: 0,
            lng: 0,
            bbox: [[-180,-180],[180,180]]
          };
        _this.setState({layer});
        _this.trigger(_this.state);
        cb();
      });
    });
  },

  saveSettings(data, cb){
    var _this = this;
    request.post('/api/layer/admin/saveSettings')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer.layer_id,
      name: data.name,
      description: data.description,
      group_id: data.group,
      published: data.published
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        var layer = _this.state.layer;
        layer.name = data.name;
        layer.description = data.description;
        layer.owned_by_group_id = data.group;
        layer.published = data.published;
        _this.setState({layer});
        //_this.trigger(_this.state);
        cb();
      });
    });
  },

  saveSource(data, cb){
    debug("saveSource");
    var _this = this;
    var layer = this.state.layer;
    request.post('/api/layer/admin/saveSource')
    .type('json').accept('json')
    .send({
      layer_id: layer.layer_id,
      source: data.source,
      license: data.license
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        layer.source = data.source;
        layer.license = data.license;
        _this.setState({layer});
        _this.trigger(_this.state);
        cb();
      });
    });
  },

  saveDataSettings(data, cb){
    debug("saveDataSettings");
    var _this = this;
    var layer = this.state.layer;
    request.post('/api/layer/admin/saveDataSettings')
    .type('json').accept('json')
    .send({
      layer_id: layer.layer_id,
      is_external: data.is_external,
      external_layer_type: data.external_layer_type,
      external_layer_config: data.external_layer_config
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        layer.is_external = data.is_external;
        layer.external_layer_type = data.external_layer_type;
        layer.external_layer_config = data.external_layer_config;
        _this.setState({layer});
        _this.trigger(_this.state);
        cb();
      });
    });
  },

  setStyle(style, legend_html, preview_position){
    var layer = this.state.layer;
    layer.style = style;
    layer.legend_html = legend_html;
    layer.preview_position = preview_position;
    this.setState({layer});
    this.trigger(this.state);
  },

  setDataType(data_type){
    var layer = this.state.layer;
    layer.data_type = data_type;
    this.setState({layer});
    this.trigger(this.state);
  },

  setComplete(cb){
    var _this = this;
    var layer = this.state.layer;
    layer.complete = true;
    request.post('/api/layer/admin/setComplete')
    .type('json').accept('json')
    .send({
      layer_id: layer.layer_id
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        _this.setState({layer});
        _this.trigger(this.state);
        cb();
      });
    });

  },

  saveStyle(data, cb){
    var _this = this;
    var layer = this.state.layer;
    request.post('/api/layer/admin/saveStyle')
    .type('json').accept('json')
    .send({
      layer_id: layer.layer_id,
      style: data.style,
      legend_html: data.legend_html,
      preview_position: data.preview_position
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        layer.style = data.style;
        layer.legend_html = data.legend_html;
        layer.preview_position = data.preview_position;
        _this.setState({layer});
        _this.trigger(_this.state);
        cb();
      });
    });
  },

  loadData(cb){
    debug("loadData");
    var _this = this;
    request.get('/api/layer/create/savedata/' + _this.state.layer.layer_id)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        _this.trigger(_this.state);
        Actions.dataLoaded();
        cb();
      });
    });
  },

  finishUpload(requestedShapefile, cb){
    var _this = this;
    request.post('/api/layer/finishupload')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer.layer_id,
      requestedShapefile
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        cb(null, res.body);
      });
    });
  },

  deleteData(data, cb){
    var _this = this;
    request.get('/api/layer/deletedata/' + _this.state.layer.layer_id)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        cb();
      });
    });
  },

  deleteLayer(cb){
    var _this = this;
    request.post('/api/layer/admin/delete')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer.layer_id
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        _this.setState({layer: emptyLayer});
        _this.trigger(_this.state);
        cb();
      });
    });
  }
});
