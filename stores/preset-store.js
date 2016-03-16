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
      {tag: 'name', label: 'Name', type: 'text', isRequired: true, id: this.idSequence++},
      {tag: 'description', label: 'Description', type: 'text', isRequired: false, id: this.idSequence++}
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
         preset = {tag:'orig_osm_id', label: 'orig_osm_id', type: 'text', isRequired: false, mapTo: tag, id: _this.idSequence++};
      }else{
         preset = {tag, label: tag, type: 'text', isRequired: false, mapTo: tag, id: _this.idSequence++};
      }
      _this.data.presets.push(preset);
    });
    this.data.pendingChanges = true;
    _this.trigger(this.data);
    actions.presetsChanged(this.data.presets);
  },

  submitPresets(create, cb){
    debug("submitPresets");
    var _this = this;
    request.post('/api/layer/presets/save')
    .type('json').accept('json')
    .send({
      layer_id: _this.data.layer_id,
      presets: _this.data.presets,
      create
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

  getInitialState() {
    return this.data;
  }
});
