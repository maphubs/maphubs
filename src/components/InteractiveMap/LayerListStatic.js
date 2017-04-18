import React from 'react';
import PropTypes from 'prop-types';
var PureRenderMixin = require('react-addons-pure-render-mixin');
var LayerListItemStatic = require('./LayerListItemStatic');
var _isEqual = require('lodash.isequal');

var LayerListStatic = React.createClass({
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
    updateLayers: PropTypes.func,
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



  render(){
    var _this = this;
    return (
      <div style={{height: '100%', padding: 0, margin: 0}}>
          <ul ref="layers" style={{height: '100%', overflow: 'auto'}} className="collection no-margin custom-scroll-bar">{
            this.state.layers.map(function (layer, i) {
              if(layer.layer_id && layer.layer_id > 0){
                return (
                  <li key={layer.layer_id} >
                    <LayerListItemStatic id={layer.layer_id} item={layer} index={i}              
                      toggleVisibility={_this.props.toggleVisibility}
                      showVisibility={_this.props.showVisibility}
                      showRemove={_this.props.showRemove}
                      showDesign={_this.props.showDesign}
                      showEdit={_this.props.showEdit}
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

module.exports = LayerListStatic;