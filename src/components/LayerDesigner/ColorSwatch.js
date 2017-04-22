//@flow
import React from 'react';

export default class ColorSwatch extends React.PureComponent {

  props: {
   onClick: Function,
   color: string
  }

  render(){
    var _this = this;
    return (
      <div className="col s2 no-padding">
        <div className="color-swatch" onClick={function(){_this.props.onClick(_this.props.color);}} style={{backgroundColor: this.props.color}}></div>
      </div>
    );
  }
}