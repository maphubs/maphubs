//@flow
import Reflux from 'reflux';
import Actions from '../actions/LayerNotesActions';
var request = require('superagent');
var debug = require('../services/debug')('stores/hub-store');
var checkClientError = require('../services/client-error-response').checkClientError;

export type LayerNotesStoreState = {
  notes?: string,
  unsavedChanges?: boolean,
  saving?: boolean
}

export default class LayerNotesStore extends Reflux.Store {

  state: LayerNotesStoreState

  constructor(){
    super();
    this.state =  {
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
 saveNotes(layer_id: number, _csrf: string, cb: Function){
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
   .end((err, res) => {
     checkClientError(res, err, cb, (cb) => {
       _this.setState({saving: false});
       cb(null);
     });
   });
 }

 setNotes(notes: string){
   var state = this.state;
   state.notes = notes;
   state.unsavedChanges = true;
   this.setState(state);
 }

}
