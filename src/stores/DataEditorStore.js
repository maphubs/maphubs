var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/DataEditorActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/DataEditorStore');
var _assignIn = require('lodash.assignin');
var _forEachRight = require('lodash.foreachright');
//var $ = require('jquery');
//var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      editing: false,
      editingLayer: null,
      originals: [], //store the orginal GeoJSON to support undo
      edits: [],
      redo: [], //if we undo edits, add them here so we can redo them
      selectedEditFeature: null, //selected feature
      createIDIndex: -9999
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners

  startEditing(layer){
    this.setState({editing: true, editingLayer:layer});
  },

  stopEditing(){
    //TODO: error if unsaved edits?
    this.setState({editing: false, editingLayer: null});
  },


  /**
   * receive updates from the drawing tool
   */
  updateFeatures(features){
    var _this = this;
    features.forEach(feature =>{
        //determine if this is a modification or an unsaved feature
         var edit;
        if(feature.properties.mhid){
          edit = {
            status: 'modification',
            geojson: feature
          };
        }else{
           edit = {
            status: 'create',
            geojson: feature
          };
        }
        _this.state.edits.push(edit);
        _this.state.redo = []; //redo resets if use makes an edit
    });
    this.trigger(this.state);
  },

  resetEdits(){
    this.setState({edits: [], redo: []});
  },

  undoEdit(){
     if(this.state.edits.length > 0){
      var lastEdit = this.state.edits.pop();
      this.state.redo.push(lastEdit);
      var currEdit = this.getLastEditForID(lastEdit.geojson.geometry.id);
      if(lastEdit.geojson.geometry.id === this.state.selectedEditFeature.geojson.geometry.id){
        //if popping an edit to the selected feature, updated it
        this.state.selectedEditFeature = currEdit;
      }
      //tell mapboxGL to update
      Actions.onFeatureUpdate(currEdit);

      this.trigger(this.state);
    }
  },

  redoEdit(){
    if(this.state.redo.length > 0){
      var prevEdit = this.state.redo.pop();
      this.state.edits.push(prevEdit);
      if(prevEdit.geojson.geometry.id === this.state.selectedEditFeature.geojson.geometry.id){
        //if popping an edit to the selected feature, updated it
        this.state.selectedEditFeature = prevEdit;
      }
      //tell mapboxGL to update
      Actions.onFeatureUpdate(prevEdit);
      this.trigger(this.state);
    }
    
  },

  getLastEditForID(id){
    var matchingEdits = [];
    _forEachRight(this.state.edits, edit => {
        if(edit.geojson.geometry.id === id){
          matchingEdits.push(edit);
        }
    });
    if(matchingEdits.length > 0){
      return matchingEdits[0];
    }else{
      var original;
      this.state.originals.forEach(orig => {
        if(orig.geojson.geometry.id === id){
          original = orig;
        }
      });
      return original;
    }
  },

  /**
   * Save all edits to the server and reset current edits
   */
  saveEdits(_csrf, cb){

  },

  updateSelectedFeatureTags(data){
    var _this = this;
    var selected = this.state.selectedEditFeature;

    //check if selected feature has been edited yet
    var editRecord;
    this.state.edits.forEach(edit => {
      if(edit.geojson.geometry.id === selected.geojson.geometry.id){
        //already edited update the edit record
        editRecord = edit;
        //update the edit record
        _assignIn(edit.geojson.properties, data);
      }
    });
    if(!editRecord){
        //update the selected feature
        _assignIn(selected.geojson.properties, data);
        //create a new modification edit
        var record = {
          status: 'modification',
          mhid: selected.mhid,
          geojson: selected.geojson
        };
        _this.state.edits.push(record);
        _this.state.redo = []; //redo resets if use makes an edit
        selected = record;
      }

    this.setState({selectedEditFeature: selected});
  },


  selectFeature(mhid, cb){
    var _this = this;
    //check if this feature is in the created or modified lists
    var selected = this.getLastEditForID(mhid);
    
    if(selected){
      this.setState({selectedEditFeature: selected});
    }else{
      var id = mhid.split(':')[1];
      //otherwise get the geojson from the server
      request.get(`/api/feature/json/${this.state.editingLayer.layer_id}/${id}/data.geojson`)
      .accept('json')
      .end((err, res) => {
        checkClientError(res, err, cb, cb => {
          var featureCollection = res.body;
          var feature = featureCollection.features[0];

          var selected = {
              status: 'original',
              mhid,
              geojson: feature
            };
          selected.geojson.geometry.id = selected.geojson.properties.mhid; 
          var original = JSON.parse(JSON.stringify(selected)); //needs to be a clone
          _this.state.originals.push(original);
          _this.setState({
            selectedEditFeature: selected
          });
          cb(selected.geojson);
        });
      });    
    }
  },

  /**
   * Called when mapbox-gl-draw is used to create new feature 
   * 
   */
  createFeature(feature){
    var created = {
        status: 'create',
        mhid: feature.geometry.id, //just a temp id as asigned by draw
        geojson: feature
      };
    this.state.originals.push(created);
    this.setState({
      selectedEditFeature: created
    });
  },

  deleteFeature(feature){
    var edit = {
      status: 'delete',
      mhid: feature.geometry.id,
      geojson: feature
    };
    this.state.edits.push(edit);
    this.state.redo = []; //redo resets if use makes an edit
    this.trigger(this.state);
  }
  
});
