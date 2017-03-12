var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var DataEditorActions = require('../../actions/DataEditorActions');
var DataEditorStore = require('../../stores/DataEditorStore');
var MapToolButton = require('../Map/MapToolButton');
var MessageActions = require('../../actions/MessageActions');
var NotificationActions = require('../../actions/NotificationActions');
var ConfirmationActions = require('../../actions/ConfirmationActions');
import Progress from '../Progress';

var EditorToolButtons = React.createClass({

  mixins:[StateMixin.connect(DataEditorStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    stopEditingLayer: React.PropTypes.func.isRequired
  },

  getInitialState(): Object {
    return {
      saving: false
    };
  },

  saveEdits(cb){
    var _this = this;
    this.setState({saving: true});
    DataEditorActions.saveEdits(this.state._csrf, function(err){
      //TODO: notify user
      _this.setState({saving: false});
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{   
         NotificationActions.showNotification({
          message: _this.__('Edits Saved'),
        });
        if(cb)cb();
      }

    });
  },

  stopEditing(){
     var _this = this;
     if(this.state.edits.length > 0){
      ConfirmationActions.showConfirmation({
        title: _this.__('Unsaved Edits'),
        message: _this.__('Do you want to save your edits before exiting?'),
        postitiveButtonText: _this.__('Save Edits'),
        negativeButtonText: _this.__('Discard Edits'),
        onPositiveResponse(){
          _this.saveEdits(()=>{
            _this.props.stopEditingLayer();  
          });    
        },
        onNegativeResponse(){
          _this.props.stopEditingLayer();   
        }
       });
     }else{
      this.props.stopEditingLayer();    
     } 
  },

  render(){
   
    return (
       <div>         
          <MapToolButton  top="10px" right="85px" icon="undo" show={true} color="#000"
            disabled={this.state.edits.length === 0}
            onClick={DataEditorActions.undoEdit} tooltipText={this.__('Undo')} />
          <MapToolButton  top="10px" right="50px" icon="redo" show={true} color="#000"
            disabled={this.state.redo.length === 0}
            onClick={DataEditorActions.redoEdit} tooltipText={this.__('Redo')} />
          <MapToolButton  top="45px" right="10px" icon="save" show={true} color="#000"
           disabled={this.state.edits.length === 0}
            onClick={this.saveEdits} tooltipText={this.__('Save Edits')} />
          <MapToolButton  top="80px" right="10px" icon="close" show={true} color="#000"
            onClick={this.stopEditing} tooltipText={this.__('Stop Editing')} />
          <Progress id="saving-edits" title={this.__('Saving')} subTitle="" dismissible={false} show={this.state.saving}/>
        </div>
    );
    
  }
});
module.exports = EditorToolButtons;
