var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/LayerNotesActions');
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;

module.exports = Reflux.createStore({
  mixins: [StateMixin],
  listenables: Actions,

  getInitialState() {
    return  {
      notes: null,
      unsavedChanges: false,
      saving: false
    };
  },

  reset(){
    this.setState(this.getInitialState());
  },

  storeDidUpdate(){
    debug('store updated');
  },

 //listeners
 saveNotes(layer_id, cb){
   debug('save layer notes');
   var _this = this;
   this.setState({saving: true});
   request.post('/api/layer/notes/save')
   .type('json').accept('json')
   .send({
     layer_id,
     notes: this.state.notes
   })
   .end(function(err, res){
     checkClientError(res, err, cb, function(cb){
       _this.setState({saving: false});
       cb(null);
     });
   });
 },

 setNotes(notes){
   var state = this.state;
   state.notes = notes;
   state.unsavedChanges = true;
   this.setState(state);
 }


});
