// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'

type Props = {
  tooltip?: string,
  tooltipPosition?: string,
  icon: string,
  onClick?:Function,
  color?: string,
  href?: string,
  large?: boolean
}

export default function FloatingButton ({ onClick, icon = 'info', href, tooltip, tooltipPosition = 'left', color = 'omh-color', large = true }: Props) {
  const clickHandler = () => {
    if (onClick) onClick()
  }
  let hrefProp = href || '#'
  return (
    <Tooltip
      disabled={!tooltip}
      title={tooltip}
      position={tooltipPosition} inertia followCursor>
      <a className={`btn-floating ${large ? 'btn-large' : ''} ${color}`}
        onClick={clickHandler} href={hrefProp}
      >
        <i className='large material-icons'>{icon}</i>
      </a>
    </Tooltip>
  )
}
