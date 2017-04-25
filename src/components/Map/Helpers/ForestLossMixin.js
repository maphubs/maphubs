
export default function() {
  var _this = this;
  this.getLayer = (type, year) => {
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
  };

  this.toggleForestLoss = () =>{
    if(!_this.state.showForestLoss){
      if(_this.props.onToggleForestLoss){
        _this.props.onToggleForestLoss(true);
      }
      _this.addForestLossLayers();
      
    }else{
      if(_this.props.onToggleForestLoss){
        _this.props.onToggleForestLoss(false);
      }
      _this.removeForestLossLayers();
      
    }
    
  };

  this.getFirstLabelLayer = () =>{
    var glStyle = _this.state.glStyle;
    var firstLayer;
    if(glStyle && glStyle.layers && glStyle.layers.length > 0){
      glStyle.layers.forEach(layer=>{
        if(!firstLayer && layer.id.startsWith('omh-label')){
          firstLayer = layer.id;
        }
      });
    }else if(_this.state.baseMap === 'default' ||
       _this.state.baseMap === 'dark' ||
       _this.state.baseMap === 'streets'){
      firstLayer = 'place_other';
    }
     return firstLayer;
  },

  this.addForestLossLayers = () => {   
    
    var addBefore = 'water';
    var glStyle = _this.state.glStyle;
    if(glStyle && glStyle.layers && glStyle.layers.length > 0){
      addBefore = glStyle.layers[0].id;
    }

    var treecoverLayer = _this.getLayer('treecover', 2001);
    _this.map.addSource(treecoverLayer.id, treecoverLayer.source);
    _this.map.addLayer(treecoverLayer.layer, addBefore);
    
    /*
    for(var i = 2001; i <= 2014; i++){
      var treecoverLayer = _this.getLayer('treecover', i);
      _this.map.addSource(treecoverLayer.id, treecoverLayer.source);
      _this.map.addLayer(treecoverLayer.layer, addBefore);
            
    }
    */
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
    _this.setState({showForestLoss: true});
  },

  this.removeForestLossLayers = () => {

     var treecoverLayer = _this.getLayer('treecover', 2001);
       _this.map.removeLayer(treecoverLayer.layer.id);
        _this.map.removeSource(treecoverLayer.id);

    for(var i = 2001; i <= 2014; i++){
      /*
       var treecoverLayer = _this.getLayer('treecover', i);
       _this.map.removeLayer(treecoverLayer.layer.id);
        _this.map.removeSource(treecoverLayer.id);
*/
       var lossLayer = _this.getLayer('lossyear', i);
        _this.map.removeLayer(lossLayer.layer.id);
        _this.map.removeSource(lossLayer.id);
    }

    _this.setState({showForestLoss: false});
  },

  this.tick = (year) => {
    //add this year
    if(year === 2001){
      _this.map.setLayoutProperty(`omh-treecover-${year}`, 'visibility', 'visible');
    }
    //this.map.setLayoutProperty(`omh-treecover-${year}`, 'visibility', 'visible');
    _this.map.setLayoutProperty(`omh-lossyear-${year}`, 'visibility', 'visible');

    setTimeout(()=>{
      if(year > 2001){
        //hide previous year
        //_this.map.setLayoutProperty(`omh-treecover-${year-1}`, 'visibility', 'none');
        //allow loss to build
        //_this.map.setLayoutProperty(`omh-lossyear-${year-1}`, 'visibility', 'none');
      }else if(year === 2001){
        //_this.map.setLayoutProperty(`omh-treecover-${2014}`, 'visibility', 'none');
        //reset hide all loss years
        for(var i = 2002; i <= 2014; i++){
          _this.map.setLayoutProperty(`omh-lossyear-${i}`, 'visibility', 'none');
        }
        
      }
    }, 1000);

  };
}
