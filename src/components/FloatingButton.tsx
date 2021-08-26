import * as React from 'react'
import { Fab } from 'react-tiny-fab'
import Add from '@material-ui/icons/Add'
import 'react-tiny-fab/dist/styles.css'

type Props = {
  tooltip?: string
  icon?: React.ReactNode
  onClick?: (...args: Array<any>) => void
  style?: Record<string, any>
  actionButtonStyles?: Record<string, any>
  position?: Record<string, any>
  children?: any
}
const FloatingButton = ({
  style,
  actionButtonStyles,
  icon,
  position,
  onClick,
  tooltip,
  children
}: Props): JSX.Element => {
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
FloatingButton.defaultProps = {
  style: {
    backgroundColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
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
export default FloatingButton
