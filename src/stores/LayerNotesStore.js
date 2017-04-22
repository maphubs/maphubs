import Reflux from 'reflux';

import Actions from '../actions/LayerNotesActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export default class LayerNotesStore extends Reflux.Store {

  constructor(){
    super();
    this.state =  {
      notes: null,
      unsavedChanges: false,
      saving: false
    };
    this.listenables = Actions;
  }

  reset(){
    this.setState({
      notes: null,
      unsavedChanges: false,
      saving: false
    });
  }

  storeDidUpdate(){
    debug('store updated');
  }

 //listeners
 saveNotes(layer_id, _csrf, cb){
   debug('save layer notes');
   var _this = this;
   this.setState({saving: true});
   request.post('/api/layer/notes/save')
   .type('json').accept('json')
   .send({
     layer_id,
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
