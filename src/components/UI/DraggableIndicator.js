//@flow
import React from 'react';

//modified from: https://resoundingechoes.net/development/style-draggable-elements-indicate-draggability/  
export default class DraggableIndicator extends React.PureComponent {

  props:  {
    width: number,
    height: number,
    dotWidth: number,
    offset: number,
    numX: number,
    numY: number,
    initialX: number,
    initialY: number
  }

  static defaultProps = {
    width: 32,
    height: 32,
    dotWidth: 2,
    offset: 4,
    numX: 4,
    numY: 4,
    initialX: 0,
    initialY: 0
  }

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
}