import React from 'react';
import PropTypes from 'prop-types';
var PureRenderMixin = require('react-addons-pure-render-mixin');
var LayerListStatic = require('./LayerListStatic');
var $ = require('jquery');

var LayerListDropDown = React.createClass({
  mixins: [PureRenderMixin],

  propTypes:  {
    id: PropTypes.string.isRequired,
    name:  PropTypes.string.isRequired,
    layers:  PropTypes.array.isRequired,
    toggleVisibility: PropTypes.func.isRequired
  },

  componentDidMount() {
    $(this.refs.dropdownButton).dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true, // Displays dropdown below the button
      alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
  },

  render(){
    return (
       <li>
        <a ref="dropdownButton" className="category-dropdown-button"
          href="#!" data-activates={this.props.id} style={{paddingRight: 0}}>{this.props.name}
          <i className="material-icons right" style={{marginLeft: 0}}>arrow_drop_down</i></a>
          <div ref="dropdownMenu" id={this.props.id} className="dropdown-content" style={{width: '300px'}}>
            <LayerListStatic layers={this.props.layers} toggleVisibility={this.props.toggleVisibility}
              showDesign={false} showRemove={false} showEdit={false} showChangeDesign={false} allowReorder={false}
            />
          </div>
      </li>
    );

  }

});

module.exports = LayerListDropDown;