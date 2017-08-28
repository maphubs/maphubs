
//@flow
module.exports = {

  getForestLossLayer(type: string, year: number){
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
    var glStyle = this.glStyle;
    var firstLayer;
    if(glStyle && glStyle.layers && glStyle.layers.length > 0){
      glStyle.layers.forEach(layer=>{
        if(!firstLayer && layer.id.startsWith('omh-label')){
          firstLayer = layer.id;
        }
      });
    }else if(this.state.baseMap === 'default' ||
       this.state.baseMap === 'dark' ||
       this.state.baseMap === 'streets'){
      firstLayer = 'place_other';
    }
     return firstLayer;
  },

  addForestLossLayers(){   
    
    var addBefore = 'water';
    var glStyle = this.glStyle;
    if(glStyle && glStyle.layers && glStyle.layers.length > 0){
      addBefore = glStyle.layers[0].id;
    }

    var treecoverLayer = this.getForestLossLayer('treecover', 2001);
    this.map.addSource(treecoverLayer.id, treecoverLayer.source);
    this.map.addLayer(treecoverLayer.layer, addBefore);
    
    /*
    for(var i = 2001; i <= 2014; i++){
      var treecoverLayer = _this.getForestLossLayer('treecover', i);
      this.addSource(treecoverLayer.id, treecoverLayer.source);
      this.addLayer(treecoverLayer.layer, addBefore);
            
    }
    */
    var firstLabelLayer = this.getFirstLabelLayer();

    for(var j = 2001; j <= 2014; j++){
      var lossLayer = this.getForestLossLayer('lossyear', j);
      this.map.addSource(lossLayer.id, lossLayer.source);
      if(firstLabelLayer){
        this.map.addLayer(lossLayer.layer, firstLabelLayer);
      }else{
        this.map.addLayer(lossLayer.layer);
      }
      
    }
    this.setState({showForestLoss: true});
  },

  removeForestLossLayers(){

    try{
      var treecoverLayer = this.getForestLossLayer('treecover', 2001);
      this.map.removeLayer(treecoverLayer.layer.id);
      this.map.removeSource(treecoverLayer.id);
    }catch(err){
      this.debugLog(err);
    }
     

    for(var i = 2001; i <= 2014; i++){
      /*
       var treecoverLayer = _this.getForestLossLayer('treecover', i);
       this.removeLayer(treecoverLayer.layer.id);
       this.removeSource(treecoverLayer.id);
      */
      try{
       var lossLayer = this.getForestLossLayer('lossyear', i);
       this.map.removeLayer(lossLayer.layer.id);
       this.map.removeSource(lossLayer.id);
      }catch(err){
        this.debugLog(err);
      }
    }

    this.setState({showForestLoss: false});
  },

  tick(year: number){
    //add this year
    if(year === 2001){
      this.map.setLayoutProperty(`omh-treecover-${year}`, 'visibility', 'visible');
    }
    //this.map.setLayoutProperty(`omh-treecover-${year}`, 'visibility', 'visible');
    this.map.setLayoutProperty(`omh-lossyear-${year}`, 'visibility', 'visible');

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
          this.map.setLayoutProperty(`omh-lossyear-${i}`, 'visibility', 'none');
        }
        
      }
    }, 1000);

  }
};
