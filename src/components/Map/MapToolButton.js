import React from 'react'
import {Tooltip} from 'react-tippy'
import NearMe from '@material-ui/icons/NearMe'
import Close from '@material-ui/icons/Close'
import Undo from '@material-ui/icons/Undo'
import Redo from '@material-ui/icons/Redo'
import Save from '@material-ui/icons/Save'
import Search from '@material-ui/icons/Search'
import Info from '@material-ui/icons/Info'
import Build from '@material-ui/icons/Build'

type Props = {|
  icon: ['near_me', 'close', 'undo', 'redo', 'save', 'search', 'info', 'build'],
  top: string,
  right: string,
  bottom: string,
  left: string,
  tooltipText?: string,
  color: string,
  onClick?: Function,
  onMouseDown?: Function,
  show: boolean,
  disabled?: boolean
|}

export default class MapToolButton extends React.PureComponent<Props, void> {
  static defaultProps = {
    top: '10px',
    color: '#212121',
    right: '10px',
    bottom: 'auto',
    left: 'auto',
    show: true
  }

  onClick = (e) => {
    if (this.props.disabled || !this.props.onClick) return
    this.props.onClick(e)
  }

  onMouseDown = (e) => {
    if (this.props.disabled || !this.props.onMouseDown) return
    this.props.onMouseDown(e)
  }

  render () {
    const {show, icon, color, disabled, tooltipText} = this.props
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
          position='bottom' inertia followCursor>
          <a ref='mapToolButton'
            onClick={this.onClick}
            onMouseDown={this.onMouseDown}
            style={{position: 'absolute',
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
              boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
              width: '30px'}}
          >
            {icon === 'near_me' &&
              <NearMe style={iconStyle} />
            }
            {icon === 'close' &&
              <Close style={iconStyle} />
            }
            {icon === 'undo' &&
              <Undo style={iconStyle} />
            }
            {icon === 'redo' &&
              <Redo style={iconStyle} />
            }
            {icon === 'save' &&
              <Save style={iconStyle} />
            }
            {icon === 'search' &&
              <Search style={iconStyle} />
            }
            {icon === 'info' &&
              <Info style={iconStyle} />
            }
            {icon === 'build' &&
              <Build style={iconStyle} />
            }
          </a>
        </Tooltip>
      )
    } else {
      return null
    }
  }
}
