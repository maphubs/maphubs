import React from 'react';
import PropTypes from 'prop-types';
var PureRenderMixin = require('react-addons-pure-render-mixin');

var ColorSwatch = React.createClass({
  mixins:[PureRenderMixin],

  propTypes: {
   onClick: PropTypes.func.isRequired,
   color: PropTypes.string.isRequired
  },

  render(){
    var _this = this;
    return (
      <div className="col s2 no-padding">
        <div className="color-swatch" onClick={function(){_this.props.onClick(_this.props.color);}} style={{backgroundColor: this.props.color}}></div>
      </div>
    );
  }
});

module.exports = ColorSwatch;
