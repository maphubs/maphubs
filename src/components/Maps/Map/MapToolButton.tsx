import React from 'react'
import { Tooltip } from 'antd'
import NearMe from '@material-ui/icons/NearMe'
import Close from '@material-ui/icons/Close'
import Undo from '@material-ui/icons/Undo'
import Redo from '@material-ui/icons/Redo'
import Save from '@material-ui/icons/Save'
import Search from '@material-ui/icons/Search'
import Info from '@material-ui/icons/Info'
import Build from '@material-ui/icons/Build'
import { TooltipPlacement } from 'antd/lib/tooltip'

type Props = {
  icon: string
  top: string
  right: string
  bottom: string
  left: string
  tooltipText?: string
  tooltipPosition: TooltipPlacement
  color: string
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void
  show: boolean
  disabled?: boolean
}
const MapToolButton = ({
  show,
  top,
  right,
  bottom,
  left,
  icon,
  color,
  disabled,
  tooltipText,
  tooltipPosition,
  onClick,
  onMouseDown
}: Props): JSX.Element => {
  if (show) {
    const iconStyle = {
      //textAlign: 'center',
      fontSize: '18px',
      verticalAlign: 'middle'
    }
    return (
      <Tooltip title={tooltipText} placement={tooltipPosition}>
        <a
          onClick={(e) => {
            if (disabled || !onClick) return
            onClick(e)
          }}
          onMouseDown={(e) => {
            if (disabled || !onMouseDown) return
            onMouseDown(e)
          }}
          style={{
            position: 'absolute',
            top,
            right,
            bottom,
            left,
            display: 'table-cell',
            height: '30px',
            zIndex: 100,
            lineHeight: '28px',
            borderRadius: '4px',
            textAlign: 'center',
            color: disabled ? '#9F9F9F' : color,
            backgroundColor: disabled ? '#DFDFDF' : 'white',
            boxShadow: '0 0 0 2px rgba(0,0,0,.1)',
            width: '30px'
          }}
        >
          {icon === 'near_me' && <NearMe style={iconStyle} />}
          {icon === 'close' && <Close style={iconStyle} />}
          {icon === 'undo' && <Undo style={iconStyle} />}
          {icon === 'redo' && <Redo style={iconStyle} />}
          {icon === 'save' && <Save style={iconStyle} />}
          {icon === 'search' && <Search style={iconStyle} />}
          {icon === 'info' && <Info style={iconStyle} />}
          {icon === 'build' && <Build style={iconStyle} />}
        </a>
      </Tooltip>
    )
  } else {
    return null
  }
}
MapToolButton.defaultProps = {
  top: '10px',
  color: '#323333',
  right: '10px',
  bottom: 'auto',
  left: 'auto',
  show: true,
  tooltipPosition: 'bottom'
}
export default MapToolButton
