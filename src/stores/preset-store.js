import Reflux from 'reflux';
import Actions from '../actions/presetActions';
import request from 'superagent';
import _findIndex from 'lodash.findindex';
import _remove from 'lodash.remove';
var debug = require('../services/debug')('preset-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export default class PresetStore extends Reflux.Store {
  
  constructor(){
    super();
    this.state = {
      layer_id: -1,
      presets: [],
      pendingChanges: false,
      idSequence: 1
    };
    this.listenables = Actions;
  }

  setLayerId(layer_id){
    debug("setLayerId");
    this.setState({layer_id});
  }

  loadPresets(presets){
    var _this = this;
    if(presets && Array.isArray(presets)){
      presets.forEach((preset) => {
        preset.id = _this.state.idSequence++;
      });
      this.setState({presets});
    }
  }

  loadDefaultPresets(){
    //called when setting up a new empty layer
    var presets = [
      {tag: 'name', label: 'Name', type: 'text', isRequired: true, showOnMap: true, id: this.idSequence++},
      {tag: 'description', label: 'Description', type: 'text', isRequired: false,  showOnMap: true, id: this.idSequence++},
      {tag: 'source', label: 'Source', type: 'text', isRequired: true,  showOnMap: true, id: this.idSequence++}
    ];
    this.setState({presets, pendingChanges: true});
  }

  setImportedTags(data){
    debug("setImportedTags");
    var _this = this;
    //clear default presets
    var presets = [];

    //convert tags to presets
    data.forEach((tag) => {
      var preset = {};
      if(tag === 'mhid'){
         preset = {tag:'orig_mhid', label: 'orig_mhid', type: 'text', isRequired: false, showOnMap: true, mapTo: tag, id: _this.idSequence++};
      }else{
         preset = {tag, label: tag, type: 'text', isRequired: false, showOnMap: true, mapTo: tag, id: _this.idSequence++};
      }
      presets.push(preset);
    });
    this.setState({presets, pendingChanges: true});
    Actions.presetsChanged(this.state.presets);
  }

  submitPresets(create, _csrf, cb){
    debug("submitPresets");
    var _this = this;
    request.post('/api/layer/presets/save')
    .type('json').accept('json')
    .send({
      layer_id: _this.state.layer_id,
      presets: _this.state.presets,
      create,
      _csrf
    })
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        _this.setState({pendingChanges: false});
        cb();
      });
    });
  }

  deletePreset(id){
    debug("delete preset:"+ id);
    _remove(this.state.presets, {id});
    this.state.pendingChanges = true;
    this.trigger(this.state);
    Actions.presetsChanged(this.state.presets);
  }

  addPreset(){
      debug("adding new preset");
      this.state.presets.push({
      tag: '',
      label: '',
      type: 'text',
      isRequired: false,
      showOnMap: true,
      id: this.idSequence++
    });
    this.state.pendingChanges = true;
    this.trigger(this.state);
    Actions.presetsChanged(this.state.presets);
  }

 updatePreset(id, preset){
   debug("update preset:" + id);
   var i = _findIndex(this.state.presets, {id});
   if(i >= 0){
     this.state.presets[i] = preset;
     this.state.pendingChanges = true;
     //this.trigger(this.state);
     //actions.presetsChanged(this.state.presets);
   }else{
     debug("Can't find preset with id: "+ id);
   }
 }

 moveUp(id){
   var index = _findIndex(this.state.presets, {id});
   if(index === 0) return;
   this.state.presets = this.move(this.state.presets, index, index-1);
   this.trigger(this.state);
   Actions.presetsChanged(this.state.presets);
 }

 moveDown(id){
   var index = _findIndex(this.state.presets, {id});
   if(index === this.state.presets.length -1) return;
   this.state.presets = this.move(this.state.presets, index, index+1);
   this.trigger(this.state);
   Actions.presetsChanged(this.state.presets);
 }

 move(array, fromIndex, toIndex) {
    array.splice(toIndex, 0, array.splice(fromIndex, 1)[0] );
    return array;
 }

}
