import React from 'react'
import ShareButtons from '../../components/ShareButtons'
import { Typography } from 'antd'
import { Story } from '../../types/story'
import useT from '../../hooks/useT'
const { Title } = Typography
type Props = {
  story: Story
}
const StorySummary = ({ story }: Props): JSX.Element => {
  const { t } = useT()

  const linkUrl = ``
  let imageUrl

  // TODO: update to support Ghost

  const title = story.title

  return (
    <div>
      {story.image && (
        <div
          style={{
            marginBottom: '10px'
          }}
        >
          <a href={linkUrl}>
            <div
              style={{
                height: '160px',
                width: '100%',
                backgroundImage: 'url()',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </a>
        </div>
      )}
      <a href={linkUrl}>
        <Title level={3}>{title}</Title>
      </a>
      <div className='story-content'>
        <p className='fade'>{story.summary}</p>
      </div>
      <a
        href={linkUrl}
        style={{
          fontSize: '12px',
          color: 'rgba(0, 0, 0, 0.45)'
        }}
      >
        {t('Read more...')}
      </a>
      <ShareButtons
        title={story.title}
        iconSize={24}
        style={{
          position: 'absolute',
          right: '10px',
          bottom: '10px'
        }}
        url={linkUrl}
        photoUrl={imageUrl}
      />
    </div>
  )
}
export default StorySummary
