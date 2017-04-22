import Reflux from 'reflux';
import Actions from '../actions/FeatureNotesActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export default class FeatureNotesStore extends Reflux.Store {

   constructor(){
    super();
    this.state = this.getDefaultState();
    this.listenables = Actions;
  }

  getDefaultState(){
    return {
      notes: null,
      unsavedChanges: false,
      saving: false
    };
  }

  reset(){
    this.setState(this.getDefaultState());
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners
 saveNotes(layer_id, mhid, _csrf, cb){
   debug('save feature notes');
   var _this = this;
   this.setState({saving: true});
   request.post('/api/feature/notes/save')
   .type('json').accept('json')
   .send({
     layer_id,
     mhid,
     notes: this.state.notes,
     _csrf
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({saving: false});
       cb(null);
     });
   });
 }

 setNotes(notes){
   var state = this.state;
   state.notes = notes;
   state.unsavedChanges = true;
   this.setState(state);
 }

}