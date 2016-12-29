// @flow
//Marker Shapes from Map Icons by Scott de Jonge https://github.com/scottdejonge/map-icons)
var React = require('react');

var Marker = React.createClass({

  propTypes:  {
    shape: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    shapeFill: React.PropTypes.string,
    shapeFillOpacity: React.PropTypes.number,
    shapeStroke: React.PropTypes.string,
    shapeStrokeWidth: React.PropTypes.number,
    icon:  React.PropTypes.string,
    iconFill: React.PropTypes.string,
    iconFillOpacity: React.PropTypes.number,
    iconStroke: React.PropTypes.string,
    iconStrokeWidth: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      shape: 'MAP_PIN',
      width: 48,
      height: 48,
      shapeFill: 'red',
      shapeFillOpacity: 1,
      shapeStroke: 'black',
      shapeStrokeWidth: 1,
      icon:  'none',
      iconFill: 'white',
      iconFillOpacity: 1,
      iconStroke: '#212121',
      iconStrokeWidth: 0
    };
  },

  render(){
     
     var markerBackground = '';
     var iconScale = 0.75;
     var viewBoxSize = 48;
     if(this.props.shape === 'SQUARE'){   
       markerBackground = (
         <rect x="1" y="1"  width={viewBoxSize} height={viewBoxSize}/>
       );
       viewBoxSize = viewBoxSize + 2;
       
     }else if(this.props.shape === 'CIRCLE'){
       let size = viewBoxSize / 2;
       markerBackground = (     
          <circle cx={size + 1} cy={size + 1} r={size} />
       );
       viewBoxSize = viewBoxSize + 2;
     }else if(this.props.shape === 'MAP_PIN'){
       iconScale = 0.5;
       markerBackground = (
         <path d="M25.015,2.4c-7.8,0-14.121,6.204-14.121,13.854C10.894,23.906,25.015,49,25.015,49s14.122-25.094,14.122-32.746	C39.137,8.604,32.812,2.4,25.015,2.4z" />
       );
     }else if(this.props.shape === 'SQUARE_PIN'){
       markerBackground = (
         <polygon points="45,1 5,1 5,41 20.093,41 25.532,49.05 30.972,41 45,41 "/>
       );
     }
     else if(this.props.shape === 'SQUARE_ROUNDED'){
       viewBoxSize = 50;
       markerBackground = (
         <path d="M49,41c0,4.4-3.6,8-8,8H9c-4.4,0-8-3.6-8-8V9c0-4.4,3.6-8,8-8h32c4.4,0,8,3.6,8,8V41z"/>
       );
     }
     var viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`;
     var icon = '';
     if(this.props.icon && this.props.icon !== 'none'){
       let iconWidth: number = viewBoxSize * iconScale;
       let iconHeight: number = viewBoxSize * iconScale;
       var x: number; // = (iconWidth / 2); // - (iconWidth / 2);
       var y: number; // = (iconHeight / 2); // - (iconHeight / 2);
       if(this.props.shape === 'MAP_PIN'){
         x = 13;
         y = 6;
       }else if(this.props.shape === 'SQUARE_PIN'){
          x = 6.5;
          y = 6.5;
       }else if(this.props.shape === 'SQUARE'){
          x = 6.5;
          y = 9.5;
       }else if(this.props.shape === 'SQUARE_ROUNDED'){
          x = 6.5;
          y = 9.5;
       }else if(this.props.shape === 'CIRCLE'){
         x = 6.5;
        y = 9.5;
       }
       
       icon = (
         <g fill={this.props.iconFill} width={viewBoxSize} height={viewBoxSize} fillOpacity={this.props.iconFillOpacity} stroke={this.props.iconStroke} strokeWidth={this.props.iconStrokeWidth}>
            <use x={x} y={y} width={iconWidth} height={iconHeight} xlinkHref={'#' + this.props.icon} />
         </g>
       );
     }
     
    return (
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" 
            width={this.props.width} height={this.props.height} x="0px" y="0px" 
            viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        <g stroke={this.props.shapeStroke} fill={this.props.shapeFill} strokeWidth={this.props.shapeStrokeWidth} fillOpacity={this.props.shapeFillOpacity}>
          {markerBackground}
        </g>    
        {icon}
      </svg>
    );
  }

});

module.exports = Marker;

