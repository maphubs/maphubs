var React = require('react');


var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var DataEditorActions = require('../../actions/DataEditorActions');
var DataEditorStore = require('../../stores/DataEditorStore');
var DataCollectionForm = require('../DataCollection/DataCollectionForm');
//var UserStore = require('../../stores/UserStore');
var _isequal = require('lodash.isequal');

//var NotificationActions = require('../../actions/NotificationActions');


var EditLayerPanel = React.createClass({

  mixins:[StateMixin.connect(DataEditorStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },


  onChange(data){
    //don't fire change if this update came from state (e.g. undo/redo)
    //the geojson may have tags not in the presets so we need to ignore them when checking for changes
    var foundChange;
    Object.keys(data).map(key =>{
    if(!_isequal(data[key], this.state.selectedEditFeature.geojson.properties[key]))
      foundChange = true;
    });
    if(foundChange){   
       DataEditorActions.updateSelectedFeatureTags(data);
    }
  },

  render(){
    //var canSave = this.state.edits.length > 0;
    var feature = this.state.selectedEditFeature;

    var layerTitle = '';
    if(this.state.editingLayer){
      layerTitle = (
        <p className="word-wrap" style={{paddingTop: '2px', paddingLeft: '2px', paddingRight: '2px', paddingBottom: '5px'}}>
          <b>{this.__('Editing:')}</b> {this.state.editingLayer.name}
        </p>
      );
    }

    var featureAttributes = '';
    if(feature){
      featureAttributes = (
        <DataCollectionForm presets={this.state.editingLayer.presets} 
          values={feature.geojson.properties}
          onChange={this.onChange}
          showSubmit={false} />
      );
    }

    return (
      <div>
        {layerTitle}
        {featureAttributes}
      </div>
    );
    
  }
});
module.exports = EditLayerPanel;
