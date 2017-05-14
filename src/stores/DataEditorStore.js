import Reflux from 'reflux';

import Actions from '../actions/DataEditorActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/DataEditorStore');
var _assignIn = require('lodash.assignin');
var _forEachRight = require('lodash.foreachright');
//var $ = require('jquery');
//var urlUtil = require('../services/url-util');
var checkClientError = require('../services/client-error-response').checkClientError;

import type {Layer} from './layer-store';

export type  DataEditorStoreState = {
   editing: boolean,
  editingLayer: ?Layer,
  originals: Array<Object>, //store the orginal GeoJSON to support undo
  edits: Array<Object>,
  redo: Array<Object>, //if we undo edits, add them here so we can redo them
  selectedEditFeature: ?Object, //selected feature
}

export default class DataEditorStore extends Reflux.Store {

  state: DataEditorStoreState

  constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(){
    return {
      editing: false,
      editingLayer: null,
      originals: [], //store the orginal GeoJSON to support undo
      edits: [],
      redo: [], //if we undo edits, add them here so we can redo them
      selectedEditFeature: null, //selected feature
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners

  startEditing(layer){
    this.setState({editing: true, editingLayer:layer});
  }

  stopEditing(){
    //TODO: error if unsaved edits?
    this.setState({editing: false, editingLayer: null});
  }

  /**
   * receive updates from the drawing tool
   */
  updateFeatures(features){
    var _this = this;
    features.forEach(feature =>{
      debug('Updating feature: ' + feature.id);

        var edit = {
            status: 'modify',
            geojson: JSON.parse(JSON.stringify(feature))
          };

        if(this.state.selectedEditFeature 
        && feature.id === this.state.selectedEditFeature.geojson.id){
        //if popping an edit to the selected feature, updated it
        this.state.selectedEditFeature = edit;
      }
      //edit history gets a different clone from the selection state
      var editCopy = JSON.parse(JSON.stringify(edit));
      _this.state.edits.push(editCopy);
      _this.state.redo = []; //redo resets if use makes an edit
    });
    this.trigger(this.state);
  }

  resetEdits(){
    this.setState({edits: [], redo: []});
  }

  undoEdit(){
     if(this.state.edits.length > 0){
      var lastEdit = this.state.edits.pop();
      var lastEditCopy = JSON.parse(JSON.stringify(lastEdit));
      this.state.redo.push(lastEditCopy);
      var currEdit = this.getLastEditForID(lastEdit.geojson.id);
      if(this.state.selectedEditFeature 
        && lastEdit.geojson.id === this.state.selectedEditFeature.geojson.id){
        //if popping an edit to the selected feature, updated it
        this.state.selectedEditFeature = currEdit;
      }
      
      if(lastEdit.status === 'create'){
        //tell mapboxGL to delete the feature
        Actions.onFeatureUpdate('delete', lastEdit);
      }else{
        //tell mapboxGL to update
        Actions.onFeatureUpdate('update', currEdit);
      }
     
      this.trigger(this.state);
    }
  }

  redoEdit(){
    if(this.state.redo.length > 0){
      var prevEdit = this.state.redo.pop();
      var prevEditCopy = JSON.parse(JSON.stringify(prevEdit));
      var prevEditCopy2 = JSON.parse(JSON.stringify(prevEdit));
      this.state.edits.push(prevEditCopy);
      if(this.state.selectedEditFeature 
        && prevEdit.geojson.id === this.state.selectedEditFeature.geojson.id){
        //if popping an edit to the selected feature, updated it
        this.state.selectedEditFeature = prevEditCopy2;
      }
      //tell mapboxGL to update
      Actions.onFeatureUpdate('update', prevEdit);
      this.trigger(this.state);
    }
    
  }

  getLastEditForID(id){
    var matchingEdits = [];
    _forEachRight(this.state.edits, edit => {
        if(edit.geojson.id === id){
          matchingEdits.push(edit);
        }
    });
    if(matchingEdits.length > 0){
      return JSON.parse(JSON.stringify(matchingEdits[0]));
    }else{
      var original;
      this.state.originals.forEach(orig => {
        if(orig.geojson.id === id){
          original = orig;
        }
      });
      if(original){
        return JSON.parse(JSON.stringify(original));
      }
      return null;
    }
  }

  /**
   * Save all edits to the server and reset current edits
   */
  saveEdits(_csrf, cb){
    var _this = this;
    var featureIds = this.getUniqueFeatureIds();
    var editsToSave = [];
    featureIds.forEach(id => {
      var featureEdits = _this.getAllEditsForFeatureId(id);
      var lastFeatureEdit = featureEdits[featureEdits.length -1];
      if(featureEdits.length > 1){      
        if(featureEdits[0].status === 'create'){
        //first edit is a create, so mark edit as create
        lastFeatureEdit.status = 'create';
        }
      }
      editsToSave.push(lastFeatureEdit);
    });

    //send edits to server
    request.post('/api/edits/save')
    .type('json').accept('json')
    .send({
        layer_id: this.state.editingLayer.layer_id,
        edits: editsToSave,
        _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {       
        if(err){
          cb(err);
        }else{
          //after saving clear all edit history
          _this.setState({
          originals: [], 
          edits: [],
          redo: [], 
          selectedEditFeature: null
        });
        cb();
        }      
      });
    });

  }

  getUniqueFeatureIds(){
    var uniqueIds = [];
    this.state.edits.forEach(edit =>{
      var id = edit.geojson.id;
      if(id && !uniqueIds.includes(id)){
        uniqueIds.push(id);
      }
    });
    return uniqueIds;
  }

  getAllEditsForFeatureId(id){
    var featureEdits = [];
    this.state.edits.forEach(edit =>{
      if(edit.geojson.id === id){
        featureEdits.push(edit);
      }
    });
    return featureEdits;
  }

  updateSelectedFeatureTags(data){
    var _this = this;
    var selected = this.state.selectedEditFeature;

    //check if selected feature has been edited yet
    var editRecord = {
      status: 'modify',
      geojson: JSON.parse(JSON.stringify(selected.geojson))
    };    

    //update the edit record
    _assignIn(editRecord.geojson.properties, data);
    var editRecordCopy = JSON.parse(JSON.stringify(editRecord));
    _this.state.edits.push(editRecordCopy);
    _this.state.redo = []; //redo resets if use makes an edit

    //update the selected feature
    this.state.selectedEditFeature = selected;
    this.trigger(this.state);
  }

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
              geojson: feature
            };
          selected.geojson.id = mhid; 
          var original = JSON.parse(JSON.stringify(selected)); //needs to be a clone
          _this.state.originals.push(original);
          _this.setState({
            selectedEditFeature: selected
          });
          cb(selected.geojson);
        });
      });    
    }
  }

  /**
   * Called when mapbox-gl-draw is used to create new feature 
   * 
   */
  createFeature(feature){
    var created = {
        status: 'create',
        geojson: JSON.parse(JSON.stringify(feature))
      };
    this.state.edits.push(created);
    this.setState({
      selectedEditFeature: created
    });
  }

  deleteFeature(feature){
    var edit = {
      status: 'delete',
      geojson: JSON.parse(JSON.stringify(feature))
    };
    this.state.edits.push(edit);
    this.state.redo = []; //redo resets if use makes an edit
    this.trigger(this.state);
  }
  
}
