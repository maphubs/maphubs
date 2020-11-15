// @flow
import type {Element} from "React";import React from 'react'

type Props = {
  width: number,
  height: number,
  dotWidth: number,
  offset: number,
  numX: number,
  numY: number,
  initialX: number,
  initialY: number
}

// modified from: https://resoundingechoes.net/development/style-draggable-elements-indicate-draggability/
export default class DraggableIndicator extends React.PureComponent<Props> {
  props: Props

  static defaultProps: {|
  dotWidth: number,
  height: number,
  initialX: number,
  initialY: number,
  numX: number,
  numY: number,
  offset: number,
  width: number,
|} = {
    width: 32,
    height: 32,
    dotWidth: 2,
    offset: 4,
    numX: 4,
    numY: 4,
    initialX: 0,
    initialY: 0
  }

  render (): Element<"svg"> {
    const { numX, numY, dotWidth, initialX, initialY, offset } = this.props
    const rows = []
    for (let i = 0; i < numX; i++) {
      for (let j = 0; j < numY; j++) {
        rows.push(
          <rect
            key={i + '-' + j} x={(initialX + i * offset)}
            y={(initialY + j * offset)} fill='#ccc'
            width={dotWidth} height={dotWidth}
          />
        )
      }
    }

    return (
      <svg
        viewBox={'0 0 ' + this.props.width + ' ' + this.props.height}
        style={{width: '100%', height: '100%'}}
      >
        {rows}
      </svg>
    )
  }
}
