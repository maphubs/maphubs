import React from 'react'
import { List } from 'antd'
import slugify from 'slugify'
import InfoIcon from '@material-ui/icons/Info'
import { Story } from '../../types/story'
import useT from '../../hooks/useT'
type Props = {
  stories: Story[]
}

const StoryList = ({ stories }: Props): JSX.Element => {
  const { t } = useT()
  return (
    <List
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
}

export default StoryList
