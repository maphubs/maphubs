var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var ColorSwatch = React.createClass({
  mixins:[PureRenderMixin],

  propTypes: {
   onClick: React.PropTypes.func.isRequired,
   color: React.PropTypes.string.isRequired
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
