import React from 'react'
type Props = {
  width: number
  height: number
  dotWidth: number
  offset: number
  numX: number
  numY: number
  initialX: number
  initialY: number
} // modified from: https://resoundingechoes.net/development/style-draggable-elements-indicate-draggability/

const DraggableIndicator = ({
  numX,
  numY,
  dotWidth,
  initialX,
  initialY,
  offset,
  width,
  height
}: Props): JSX.Element => {
  const rows = []

  for (let i = 0; i < numX; i++) {
    for (let j = 0; j < numY; j++) {
      rows.push(
        <rect
          key={i + '-' + j}
          x={initialX + i * offset}
          y={initialY + j * offset}
          fill='#ccc'
          width={dotWidth}
          height={dotWidth}
        />
      )
    }
  }

  return (
    <svg
      viewBox={'0 0 ' + width + ' ' + height}
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      {rows}
    </svg>
  )
}
DraggableIndicator.defaultProps = {
  width: 32,
  height: 32,
  dotWidth: 2,
  offset: 4,
  numX: 4,
  numY: 4,
  initialX: 0,
  initialY: 0
}
export default DraggableIndicator
