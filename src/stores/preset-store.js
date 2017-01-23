var Reflux = require('reflux');
var actions = require('../actions/presetActions');
var request = require('superagent');
var _findIndex = require('lodash.findindex');
var _remove =  require('lodash.remove');
var debug = require('../services/debug')('preset-store');
var checkClientError = require('../services/client-error-response').checkClientError;



module.exports = Reflux.createStore({
  data: {},

  init() {
    this.data = {
      layer_id: -1,
      presets: [],
      pendingChanges: false
    };

    this.idSequence = 1;
    this.listenTo(actions.setImportedTags, this.setImportedTags);
    this.listenTo(actions.submitPresets, this.submitPresets);
    this.listenTo(actions.addPreset, this.addPreset);
    this.listenTo(actions.deletePreset, this.deletePreset);
    this.listenTo(actions.updatePreset, this.updatePreset);
    this.listenTo(actions.setLayerId, this.setLayerId);
    this.listenTo(actions.loadPresets, this.loadPresets);
    this.listenTo(actions.loadDefaultPresets, this.loadDefaultPresets);
    this.listenTo(actions.moveUp, this.moveUp);
    this.listenTo(actions.moveDown, this.moveDown);
  },

  setLayerId(layerId){
    debug("setLayerId");
    this.data.layer_id = layerId;
  },

  loadPresets(presets){
    var _this = this;
    presets.forEach(function(preset){
      preset.id = _this.idSequence++;
    });
    this.data.presets = presets;
    this.trigger(this.data);
  },

  loadDefaultPresets(){
    //called when setting up a new empty layer
    var presets = [
      {tag: 'name', label: 'Name', type: 'text', isRequired: true, showOnMap: true, id: this.idSequence++},
      {tag: 'description', label: 'Description', type: 'text', isRequired: false,  showOnMap: true, id: this.idSequence++},
      {tag: 'source', label: 'Source', type: 'text', isRequired: true,  showOnMap: true, id: this.idSequence++}
    ];
    this.data.presets = presets;
    this.data.pendingChanges = true;
    this.trigger(this.data);
  },

  setImportedTags(data){
    debug("setImportedTags");
    var _this = this;
    //clear default presets
    delete this.data.presets;
    this.data.presets = [];
    _this.trigger(this.data);
    //convert tags to presets
    data.forEach(function(tag){
      var preset = {};
      if(tag == 'osm_id'){
         preset = {tag:'orig_osm_id', label: 'orig_osm_id', type: 'text', isRequired: false, showOnMap: true, mapTo: tag, id: _this.idSequence++};
      }else{
         preset = {tag, label: tag, type: 'text', isRequired: false, showOnMap: true, mapTo: tag, id: _this.idSequence++};
      }
      _this.data.presets.push(preset);
    });
    this.data.pendingChanges = true;
    _this.trigger(this.data);
    actions.presetsChanged(this.data.presets);
  },

  submitPresets(create, _csrf, cb){
    debug("submitPresets");
    var _this = this;
    request.post('/api/layer/presets/save')
    .type('json').accept('json')
    .send({
      layer_id: _this.data.layer_id,
      presets: _this.data.presets,
      create,
      _csrf
    })
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        _this.data.pendingChanges = false;
        _this.trigger(_this.data);
        cb();
      });
    });
  },

  deletePreset(id){
    debug("delete preset:"+ id);
    _remove(this.data.presets, {id});
    this.data.pendingChanges = true;
    this.trigger(this.data);
    actions.presetsChanged(this.data.presets);
  },

  addPreset(){
      debug("adding new preset");
      this.data.presets.push({
      tag: '',
      label: '',
      type: 'text',
      isRequired: false,
      showOnMap: true,
      id: this.idSequence++
    });
    this.data.pendingChanges = true;
    this.trigger(this.data);
    actions.presetsChanged(this.data.presets);
  },

 updatePreset(id, preset){
   debug("update preset:" + id);
   var i = _findIndex(this.data.presets, {id});
   if(i >= 0){
     this.data.presets[i] = preset;
     this.data.pendingChanges = true;
     //this.trigger(this.data);
     //actions.presetsChanged(this.data.presets);
   }else{
     debug("Can't find preset with id: "+ id);
   }

 },

 moveUp(id){
   var index = _findIndex(this.data.presets, {id});
   if(index === 0) return;
   this.data.presets = this.move(this.data.presets, index, index-1);
   this.trigger(this.data);
   actions.presetsChanged(this.data.presets);
 },

 moveDown(id){
   var index = _findIndex(this.data.presets, {id});
   if(index === this.data.presets.length -1) return;
   this.data.presets = this.move(this.data.presets, index, index+1);
   this.trigger(this.data);
   actions.presetsChanged(this.data.presets);
 },

 move(array, fromIndex, toIndex) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
    return array;
  },

  getInitialState() {
    return this.data;
  }
});
