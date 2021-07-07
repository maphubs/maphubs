import React from 'react'
import { Avatar } from 'antd'
import PersonIcon from '@material-ui/icons/Person'
type Props = {
  src?: string
  size?: number
  t: (v: string) => string
}
const UserIcon = ({ size, src, t }: Props): JSX.Element => {
  return src ? (
    <Avatar size={size || 32} src={src} alt={t('User Profile Photo')} />
  ) : (
    <Avatar
      size={size}
      icon={
        <PersonIcon
          style={{
            fontSize: `${size || 32}px`
          }}
        />
      }
      alt={t('User Profile Photo')}
    />
  )
}
export default UserIcon
