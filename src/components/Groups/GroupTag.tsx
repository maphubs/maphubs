import React, { useState } from 'react'
import { Avatar, Tooltip } from 'antd'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
type Props = {
  group: string
  size?: number
}

const GroupTag = ({ group, size }: Props): JSX.Element => {
  const [failed, setFailed] = useState(false)
  const baseUrl = urlUtil.getBaseUrl()

  if (!group) {
    return <></>
  }

  return (
    <div>
      <Tooltip title={group} placement='top'>
        <a
          target='_blank'
          className='no-padding'
          rel='noopener noreferrer'
          href={`${baseUrl}/group/${group}`}
          style={{
            height: 'initial'
          }}
        >
          {!failed && (
            <Avatar
              alt={group}
              size={size}
              src={`/api/group/${group}/image.png`}
              onError={() => {
                setFailed(true)
              }}
            />
          )}
          {failed && (
            <Avatar
              size={size || 24}
              style={{
                color: '#FFF'
              }}
            >
              {group.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </a>
      </Tooltip>
    </div>
  )
}
export default GroupTag
