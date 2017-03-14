var debug = require('../../services/debug')('Map/ForestLossMixin');
var _assignIn = require('lodash.assignin');
var Reflux = require('reflux');

var AnimationActions = require('../../actions/map/AnimationActions');

var ForestLossMixin = {

  getLayer(type, year){
    return {
      "id": `omh-${type}-${year}`,
      "source": {
          "type": "raster",
          scheme: "xyz",
          maxzoom: 19,
          minzoom: 0,
          "tiles": [
          `https://storage.googleapis.com/moabi-raster-tiles/hansen-umd-${type}-${year}/{z}/{x}/{y}.png`
          ],
          "tileSize": 256
      },
      "layer": {
          "id": `omh-${type}-${year}`,
          "type": "raster",
          "source": `omh-${type}-${year}`,
          "minzoom": 0,
          "maxzoom": 18,
          "paint": {
            "raster-opacity": 1
          },
          "layout": {
            "visibility": "none"
          }
        }
    };
  },

  toggleForestLoss(){
    if(!this.state.showForestLoss){
      if(this.props.onToggleForestLoss){
        this.props.onToggleForestLoss(true);
      }
      this.addForestLossLayers();
      
    }else{
      if(this.props.onToggleForestLoss){
        this.props.onToggleForestLoss(false);
      }
      this.removeForestLossLayers();
      
    }
    
  },

  getFirstLabelLayer(){
    var glStyle = this.state.glStyle;
    var firstLayer;
    if(glStyle && glStyle.layers && glStyle.layers.length > 0){
      glStyle.layers.forEach(layer=>{
        if(!firstLayer && layer.id.startsWith('omh-label')){
          firstLayer = layer.id;
        }
      });
    }
     return firstLayer;
  },

  addForestLossLayers(){   
    var _this = this;
    /*
    var addBefore;
    var glStyle = this.state.glStyle;
    if(glStyle && glStyle.layers && glStyle.layers.length > 0){
      addBefore = glStyle.layers[0].id;
    }
    */
    for(var i = 2001; i <= 2014; i++){
      var treecoverLayer = _this.getLayer('treecover', i);
      _this.map.addSource(treecoverLayer.id, treecoverLayer.source);
      _this.map.addLayer(treecoverLayer.layer, 'water');
      /*
       if(addBefore){
        //add treecover below user layers
        _this.map.addLayer(treecoverLayer.layer, addBefore);
      }else{
        _this.map.addLayer(treecoverLayer.layer);
      }
      */
    }
    var firstLabelLayer = this.getFirstLabelLayer();

    for(var j = 2001; j <= 2014; j++){
      var lossLayer = _this.getLayer('lossyear', j);
      _this.map.addSource(lossLayer.id, lossLayer.source);
      if(firstLabelLayer){
        _this.map.addLayer(lossLayer.layer, firstLabelLayer);
      }else{
        _this.map.addLayer(lossLayer.layer);
      }
      
    }
    this.setState({showForestLoss: true});
  },

  removeForestLossLayers(){
    var _this = this;

    for(var i = 2001; i <= 2014; i++){
       var treecoverLayer = _this.getLayer('treecover', i);
       _this.map.removeLayer(treecoverLayer.layer.id);
        _this.map.removeSource(treecoverLayer.id);

       var lossLayer = _this.getLayer('lossyear', i);
        _this.map.removeLayer(lossLayer.layer.id);
        _this.map.removeSource(lossLayer.id);
    }

    this.setState({showForestLoss: false});
  },

  tick(year){
    var _this = this;
    //add this year
    this.map.setLayoutProperty(`omh-treecover-${year}`, 'visibility', 'visible');
    this.map.setLayoutProperty(`omh-lossyear-${year}`, 'visibility', 'visible');

    setTimeout(()=>{
      if(year > 2001){
        //hide previous year
        _this.map.setLayoutProperty(`omh-treecover-${year-1}`, 'visibility', 'none');
        //allow loss to build
        //_this.map.setLayoutProperty(`omh-lossyear-${year-1}`, 'visibility', 'none');
      }else if(year === 2001){
        _this.map.setLayoutProperty(`omh-treecover-${2014}`, 'visibility', 'none');
        //reset hide all loss years
        for(var i = 2002; i <= 2014; i++){
          _this.map.setLayoutProperty(`omh-lossyear-${i}`, 'visibility', 'none');
        }
        
      }
    }, 1000);

  }

};

module.exports = _assignIn(ForestLossMixin,Reflux.listenTo(AnimationActions.tick, 'tick'));