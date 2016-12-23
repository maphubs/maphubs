var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../../actions/map/BaseMapActions');

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return {
      baseMap: 'default',
      showEditBaseMap: false,
      showBaseMaps: false
    };

  },

  setBaseMap(baseMap){
    this.setState({baseMap});
  },

  toggleBaseMaps(){
    if(this.state.showEditBaseMap){
      this.closeEditBaseMap();
    }
    if(this.state.showBaseMaps){
      this.closeBaseMaps();
    }else{
      this.setState({showBaseMaps: true});
    }
  },

  closeBaseMaps(){
    this.setState({showBaseMaps: false});
  },

    toggleEditBaseMap(){
    if(this.state.showBaseMaps){
      this.closeBaseMaps();
    }
    if(this.state.showEditBaseMap){
      this.closeEditBaseMap();
    }else{
      this.setState({showEditBaseMap: true});
    }
  },

  closeEditBaseMap(){
    this.setState({showEditBaseMap: false});
  },

  getBaseMapFromName(mapName, cb){
    var mapboxName = 'light-v9';
    var optimize = true;

    if (mapName == 'default') {
        mapboxName = 'light-v9';
        optimize = true;
    }
    else if(mapName == 'dark'){
      mapboxName = 'dark-v9';
      optimize = true;
    }
    else if(mapName == 'outdoors'){
      mapboxName = 'outdoors-v9';
      optimize = true;
    }
    else if(mapName == 'streets'){
      mapboxName = 'streets-v9';
      optimize = true;
    }
    else if(mapName == 'mapbox-satellite'){
      mapboxName = 'satellite-streets-v9';
      optimize = true;
    }
    var url = 'mapbox://styles/mapbox/' + mapboxName;
    if(optimize){
      url += '?optimize=true'; //requires mapbox-gl-js 0.24.0+
    }
    cb(url);
  },

  });