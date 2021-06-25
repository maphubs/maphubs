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
type Props = {
  icon: ['near_me', 'close', 'undo', 'redo', 'save', 'search', 'info', 'build']
  top: string
  right: string
  bottom: string
  left: string
  tooltipText?: string
  tooltipPosition: string
  color: string
  onClick?: (...args: Array<any>) => any
  onMouseDown?: (...args: Array<any>) => any
  show: boolean
  disabled?: boolean
}
export default class MapToolButton extends React.Component<Props, void> {
  static defaultProps = {
    top: '10px',
    color: '#323333',
    right: '10px',
    bottom: 'auto',
    left: 'auto',
    show: true,
    tooltipPosition: 'bottom'
  }

  shouldComponentUpdate(nextProps: Props) {
    if (nextProps.show !== this.props.show) return true
    if (nextProps.disabled !== this.props.disabled) return true
    return false
  }

  onClick = (e) => {
    if (this.props.disabled || !this.props.onClick) return
    this.props.onClick(e)
  }
  onMouseDown = (e) => {
    if (this.props.disabled || !this.props.onMouseDown) return
    this.props.onMouseDown(e)
  }

  render() {
    const {
      show,
      icon,
      color,
      disabled,
      tooltipText,
      tooltipPosition
    } = this.props

    if (show) {
      const iconStyle = {
        textAlign: 'center',
        fontSize: '18px',
        verticalAlign: 'middle'
      }
      return (
        <Tooltip
          disabled={!tooltipText}
          title={tooltipText}
          placement={tooltipPosition}
        >
          <a
            onClick={this.onClick}
            onMouseDown={this.onMouseDown}
            style={{
              position: 'absolute',
              top: this.props.top,
              right: this.props.right,
              bottom: this.props.bottom,
              left: this.props.left,
              display: 'table-cell',
              height: '30px',
              zIndex: '100',
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
}