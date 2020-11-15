// @flow
import type {Node} from "React";// Marker Shapes from Map Icons by Scott de Jonge https://github.com/scottdejonge/map-icons)
import React from 'react'
import Icons from './Icons'

type Props = {
  shape: string,
  width: number,
  height: number,
  shapeFill: string,
  shapeFillOpacity: number,
  shapeStroke: string,
  shapeStrokeWidth: number,
  icon: string,
  iconFill: string,
  iconFillOpacity: number,
  iconStroke: string,
  iconStrokeWidth: number
}

export default class Marker extends React.PureComponent<Props> {
  props: Props

  static defaultProps: {|
  height: number,
  icon: string,
  iconFill: string,
  iconFillOpacity: number,
  iconStroke: string,
  iconStrokeWidth: number,
  shape: string,
  shapeFill: string,
  shapeFillOpacity: number,
  shapeStroke: string,
  shapeStrokeWidth: number,
  width: number,
|} = {
    shape: 'MAP_PIN',
    width: 48,
    height: 48,
    shapeFill: 'red',
    shapeFillOpacity: 1,
    shapeStroke: 'black',
    shapeStrokeWidth: 1,
    icon: 'none',
    iconFill: 'white',
    iconFillOpacity: 1,
    iconStroke: '#323333',
    iconStrokeWidth: 0
  }

  render (): Node {
    const {shape, icon} = this.props
    let markerBackground = ''
    let iconScale = 0.75
    let viewBoxSize = 48
    if (shape === 'SQUARE') {
      markerBackground = (
        <rect x='1' y='1' width={viewBoxSize} height={viewBoxSize} />
      )
      viewBoxSize = viewBoxSize + 2
    } else if (shape === 'CIRCLE') {
      const size = viewBoxSize / 2
      markerBackground = (
        <circle cx={size + 1} cy={size + 1} r={size} />
      )
      viewBoxSize = viewBoxSize + 2
    } else if (shape === 'MAP_PIN') {
      iconScale = 0.5
      markerBackground = (
        <path d='M25.015,2.4c-7.8,0-14.121,6.204-14.121,13.854C10.894,23.906,25.015,49,25.015,49s14.122-25.094,14.122-32.746 C39.137,8.604,32.812,2.4,25.015,2.4z' />
      )
    } else if (shape === 'SQUARE_PIN') {
      markerBackground = (
        <polygon points='45,1 5,1 5,41 20.093,41 25.532,49.05 30.972,41 45,41 ' />
      )
    } else if (shape === 'SQUARE_ROUNDED') {
      viewBoxSize = 50
      markerBackground = (
        <path d='M49,41c0,4.4-3.6,8-8,8H9c-4.4,0-8-3.6-8-8V9c0-4.4,3.6-8,8-8h32c4.4,0,8,3.6,8,8V41z' />
      )
    }
    const viewBox = `0 0 ${viewBoxSize} ${viewBoxSize}`
    const iconWidth: number = viewBoxSize * iconScale
    const iconHeight: number = viewBoxSize * iconScale
    let x: number // = (iconWidth / 2); // - (iconWidth / 2);
    let y: number // = (iconHeight / 2); // - (iconHeight / 2);

    if (icon && icon !== 'none') {
      if (shape === 'MAP_PIN') {
        x = 13
        y = 6
      } else if (shape === 'SQUARE_PIN') {
        x = 6.5
        y = 6.5
      } else if (shape === 'SQUARE') {
        x = 6.5
        y = 9.5
      } else if (shape === 'SQUARE_ROUNDED') {
        x = 6.5
        y = 9.5
      } else if (shape === 'CIRCLE') {
        x = 6.5
        y = 9.5
      }
    }

    let IconComponent
    if (icon && icon !== 'none') {
      IconComponent = Icons.getIcon(icon)
    }

    return (
      <>
        <svg
          xmlns='http://www.w3.org/2000/svg' version='1.1'
          width={this.props.width} height={this.props.height} x='0px' y='0px'
          viewBox={viewBox} preserveAspectRatio='xMidYMid meet'
        >
          <g stroke={this.props.shapeStroke} fill={this.props.shapeFill} strokeWidth={this.props.shapeStrokeWidth} fillOpacity={this.props.shapeFillOpacity}>
            {markerBackground}
          </g>
          {IconComponent &&
            <g
              fill={this.props.iconFill}
              width={viewBoxSize}
              height={viewBoxSize}
              fillOpacity={this.props.iconFillOpacity}
              stroke={this.props.iconStroke}
              strokeWidth={this.props.iconStrokeWidth}
            >
              <IconComponent />
              <use x={x} y={y} width={iconWidth} height={iconHeight} href={`#${icon}`} />
            </g>}
        </svg>
      </>
    )
  }
}
