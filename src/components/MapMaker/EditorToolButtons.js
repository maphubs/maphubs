var React = require('react');


var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var DataEditorActions = require('../../actions/DataEditorActions');
var DataEditorStore = require('../../stores/DataEditorStore');
var MapToolButton = require('../Map/MapToolButton');

var EditorToolButtons = React.createClass({

  mixins:[StateMixin.connect(DataEditorStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    stopEditingLayer: React.PropTypes.func.isRequired
  },

  saveEdits(){
    DataEditorActions.saveEdits(this.state._csrf, function(){
      //TODO: notify user
    });
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
            onClick={this.props.stopEditingLayer} tooltipText={this.__('Stop Editing')} />
        </div>
    );
    
  }
});
module.exports = EditorToolButtons;
