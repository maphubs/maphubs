var React = require('react');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var HubActions = require('../../actions/HubActions');
var HomePageMapLayerItem = require('./HomePageMapLayerItem');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');

import update from 'react/lib/update';

var HomePageMapLayers = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  toggleVisibility(layer_id){
    HubActions.toggleVisibility(layer_id, function(){});
  },

  moveLayer(dragIndex, hoverIndex) {
    const layers = this.state.layers;
    const dragLayer = layers[dragIndex];

    var updatedLayers = update(layers, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragLayer],
        ]
    });

    HubActions.updateLayers(updatedLayers);

  },

  render() {
    return (
      <div>
        <ul ref="layers" className="collection with-header no-margin">
        <li className="collection-header" key="header"
        style={{paddingTop: '5px', paddingBottom: '5px'}}
        >
          <b>{this.__('Map Layers')}</b>
        </li>
        {this.state.layers.map((layer, i) => (
          <li key={layer.layer_id} >
            <HomePageMapLayerItem layer={layer} index={i}              
              toggleVisibility={this.toggleVisibility}
              moveLayer={this.moveLayer}
            />
          </li>
        ))}
        </ul>
    </div>
    );
  }

});

module.exports = DragDropContext(HTML5Backend)(HomePageMapLayers);
