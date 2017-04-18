import React from 'react';
import PropTypes from 'prop-types';
var PureRenderMixin = require('react-addons-pure-render-mixin');
var LayerListItem = require('./LayerListItem');
var _isEqual = require('lodash.isequal');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');

import update from 'react/lib/update';

var LayerList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes:  {
    layers:  PropTypes.array,
    showVisibility: PropTypes.bool,
    showDesign: PropTypes.bool,
    showRemove: PropTypes.bool,
    showEdit: PropTypes.bool,
    showChangeDesign: PropTypes.bool,
    toggleVisibility: PropTypes.func,
    removeFromMap: PropTypes.func,
    showLayerDesigner: PropTypes.func,
    updateLayers: PropTypes.func.isRequired,
    editLayer: PropTypes.func
  },

  getDefaultProps() {
    return {

    };
  },

  getInitialState(){
    var layers = JSON.parse(JSON.stringify(this.props.layers));
    return {
      layers
    };
  },

  componentWillReceiveProps(nextProps){
     if(!_isEqual(nextProps.layers, this.state.layers)){
       var layers = JSON.parse(JSON.stringify(nextProps.layers));
     this.setState({layers});
    }
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

    this.props.updateLayers(updatedLayers);

  },

  render(){
    var _this = this;
    return (
      <div style={{height: '100%', padding: 0, margin: 0}}>
          <ul ref="layers" style={{height: '100%', overflow: 'auto'}} className="collection no-margin custom-scroll-bar">{
            this.state.layers.map(function (layer, i) {
              if(layer.layer_id && layer.layer_id > 0){
                return (
                  <li key={layer.layer_id} >
                    <LayerListItem id={layer.layer_id} item={layer} index={i}              
                      toggleVisibility={_this.props.toggleVisibility}
                      showVisibility={_this.props.showVisibility}
                      showRemove={_this.props.showRemove}
                      showDesign={_this.props.showDesign}
                      showEdit={_this.props.showEdit}
                      moveItem={_this.moveLayer}
                      removeFromMap={_this.props.removeFromMap}
                      showLayerDesigner={_this.props.showLayerDesigner}
                      editLayer={_this.props.editLayer}
                    />
                  </li>
                );
              }
            })
          }</ul>
        </div>
    );

  }

});

module.exports = DragDropContext(HTML5Backend)(LayerList);