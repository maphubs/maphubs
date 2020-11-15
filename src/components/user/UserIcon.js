// @flow
import type {Node} from "React";import React from 'react'
import { Avatar } from 'antd'
import PersonIcon from '@material-ui/icons/Person'

type Props = {
  src?: string,
  size: number,
  t: Function
}

export default class UserIcon extends React.PureComponent<Props, void> {
  static defaultProps: {|size: number|} = {
    size: 32
  }

  render (): Node {
    const { size, src, t } = this.props
    if (src) {
      return (
        <Avatar
          size={size}
          src={src} alt={t('User Profile Photo')}
        />)
    } else {
      return (
        <Avatar
          size={size}
          icon={<PersonIcon style={{fontSize: `${size}px`}} />}
          alt={t('User Profile Photo')}
        />)
    }
  }
}
