var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');


//modified from: https://resoundingechoes.net/development/style-draggable-elements-indicate-draggability/  
var draggableIndicator = React.createClass({
  mixins: [PureRenderMixin],

  propTypes:  {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    dotWidth:  React.PropTypes.number,
    offset:  React.PropTypes.number,
    numX:  React.PropTypes.number,
    numY:  React.PropTypes.number,
    initialX: React.PropTypes.number,
    initialY: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      width: 32,
      height: 32,
      dotWidth: 2,
      offset: 4,
      numX: 4,
      numY: 4,
      initialX: 0,
      initialY: 0
    };
  },

  render(){
    var _this = this;

    var rows = [];
    for(var i = 0; i < _this.props.numX; i++){
      for(var j = 0; j < _this.props.numY; j++){
        rows.push(
          <rect key={i + '-' + j} x={(_this.props.initialX + i*_this.props.offset )}
            y={( _this.props.initialY + j*_this.props.offset )} fill="#ccc"
            width={_this.props.dotWidth} height={_this.props.dotWidth} 
          />
        );
      }
    } 

    return (
      <svg viewBox={'0 0 ' + this.props.width + ' ' + this.props.height} 
      style={{width: '100%', height: '100%'}}>
        {rows}
      </svg>
    );

  }

});

module.exports = draggableIndicator;