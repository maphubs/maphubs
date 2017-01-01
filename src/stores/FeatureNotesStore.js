var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var Actions = require('../actions/FeatureNotesActions');
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
 saveNotes(layer_id, osm_id, _csrf, cb){
   debug('save feature notes');
   var _this = this;
   this.setState({saving: true});
   request.post('/api/feature/notes/save')
   .type('json').accept('json')
   .send({
     layer_id,
     osm_id,
     notes: this.state.notes,
     _csrf
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
