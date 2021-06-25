import * as React from 'react'
import { Fab } from 'react-tiny-fab'
import Add from '@material-ui/icons/Add'
import 'react-tiny-fab/dist/styles.css'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  tooltip?: string
  icon?: React.ReactNode
  onClick?: (...args: Array<any>) => any
  style?: Record<string, any>
  actionButtonStyles?: Record<string, any>
  position?: Record<string, any>
  children?: any
}
export default class FloatingButton extends React.Component<Props, void> {
  static defaultProps: {
    actionButtonStyles: {}
    icon: React.ReactNode
    onClick: () => void
    position: {
      bottom: number
      right: number
    }
    style: {
      backgroundColor: any
      zIndex: number
    }
  } = {
    style: {
      backgroundColor: MAPHUBS_CONFIG.primaryColor,
      zIndex: 999
    },
    actionButtonStyles: {},
    onClick: () => {},
    icon: <Add />,
    position: {
      bottom: 24,
      right: 24
    }
  }

  render(): React.ReactNode {
    const {
      style,
      actionButtonStyles,
      icon,
      position,
      onClick,
      tooltip,
      children
    } = this.props
    return (
      <Fab
        mainButtonStyles={style}
        actionButtonStyles={actionButtonStyles}
        position={position}
        icon={icon}
        text={tooltip}
        onClick={onClick}
        event='click'
      >
        {children}
      </Fab>
    )
  }
}