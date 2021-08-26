import React, { useState } from 'react'
import { Avatar } from 'antd'
import { IntlProvider, FormattedDate } from 'react-intl'
import useT from '../../hooks/useT'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { Story } from '../../types/story'

const StoryHeader = ({ story }: { story: Story }): JSX.Element => {
  const { t, locale } = useT()
  const [groupLogoFailed, setGroupLogoFailed] = useState(false)

  const baseUrl = urlUtil.getBaseUrl() || ''
  let authorText = ''

  if (story.author) {
    authorText = t(story.author) + ' - '
  }

  const groupUrl = `${baseUrl}/group/${story.owned_by_group_id}`
  return (
    <div>
      <div
        style={{
          height: '40px',
          marginBottom: '10px'
        }}
      >
        <div
          className='valign-wrapper'
          style={{
            width: '36px',
            float: 'left'
          }}
        >
          <a
            className='valign'
            style={{
              marginTop: '4px'
            }}
            href={groupUrl}
          >
            {!groupLogoFailed && (
              <Avatar
                alt={story.owned_by_group_id}
                size={36}
                src={`/api/group/${story.owned_by_group_id}/thumbnail`}
                onError={() => {
                  console.error('Group Logo Failed')
                  setGroupLogoFailed(true)
                  return true
                }}
              />
            )}
            {groupLogoFailed && (
              <Avatar
                size={36}
                style={{
                  color: '#FFF'
                }}
              >
                {story.owned_by_group_id.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </a>
        </div>
        <div
          style={{
            marginLeft: '46px'
          }}
        >
          <p
            style={{
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4rem'
            }}
            className='truncate'
          >
            {authorText}
            <a
              className='valign'
              style={{
                marginTop: 0,
                marginBottom: 0,
                marginLeft: '5px',
                fontSize: '14px',
                lineHeight: '1.4rem'
              }}
              href={groupUrl}
            >
              {story.groupname ? t(story.groupname) : story.owned_by_group_id}
            </a>
          </p>
          <p
            style={{
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4rem'
            }}
          >
            <IntlProvider locale={locale}>
              <FormattedDate
                value={story.published_at}
                month='long'
                day='numeric'
                year='numeric'
              />
            </IntlProvider>
          </p>
        </div>
      </div>
    </div>
  )
}
export default StoryHeader
