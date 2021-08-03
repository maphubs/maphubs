import React from 'react'
import { Avatar } from 'antd'
import PersonIcon from '@material-ui/icons/Person'
import useT from '../../hooks/useT'
type Props = {
  src?: string
}
const UserIcon = ({ src }: Props): JSX.Element => {
  const { t } = useT()
  const size = 24
  const alt = t('User Profile Photo')
  return src ? (
    <Avatar size={size} src={src} alt={alt} />
  ) : (
    <Avatar
      size={size}
      icon={
        <PersonIcon
          style={{
            fontSize: `${size}px`
          }}
        />
      }
      alt={alt}
    />
  )
}
export default UserIcon
