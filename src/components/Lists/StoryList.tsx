import React from 'react'
import { List } from 'antd'
import slugify from 'slugify'
import InfoIcon from '@material-ui/icons/Info'
type Props = {
  stories: Array<Record<string, any>>
  showTitle: boolean
  t: any
}

const StoryList = ({ stories, showTitle, t }: Props): JSX.Element => (
  <List
    header={showTitle && <h4>{t('Stories')}</h4>}
    dataSource={stories}
    bordered
    renderItem={(story) => {
      let title = t(story.title)
      title = title
        .replace('<br>', '')
        .replace('<br />', '')
        .replace('<p>', '')
        .replace('</p>', '')
      return (
        <List.Item
          actions={[
            <a
              key='open-story-info'
              href={`/story/${slugify(title)}/${story.story_id}`}
            >
              <InfoIcon />
            </a>
          ]}
        >
          <span>{title}</span>
        </List.Item>
      )
    }}
  />
)

StoryList.defaultProps = {
  showTitle: true
}

export default StoryList
