// @flow
import * as React from 'react'
import { Fab } from 'react-tiny-fab'
import Add from '@material-ui/icons/Add'
import 'react-tiny-fab/dist/styles.css'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {
  tooltip?: string,
  icon?: React.Node,
  onClick?: Function,
  style?: Object,
  actionButtonStyles?: Object,
  position?: Object,
  children?: any
}

export default class FloatingButton extends React.Component<Props, void> {
  static defaultProps = {
    style: {
      backgroundColor: MAPHUBS_CONFIG.primaryColor
    },
    actionButtonStyles: {},
    onClick: () => {},
    icon: <Add />,
    position: { bottom: 24, right: 24 }
  }

  render () {
    const {style, actionButtonStyles, icon, position, onClick, tooltip, children} = this.props

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
