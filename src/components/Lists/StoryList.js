// @flow
import React from 'react'
import { List } from 'antd'
import slugify from 'slugify'
import InfoIcon from '@material-ui/icons/Info'

type Props = {|
  stories: Array<Object>,
  showTitle: boolean,
  t: Function
|}

export default class StoryList extends React.Component<Props, void> {
  static defaultProps = {
    showTitle: true
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const { stories, showTitle, t } = this.props

    return (
      <List
        header={showTitle && (<h4>{t('Stories')}</h4>)}
        dataSource={stories}
        bordered
        renderItem={story => {
          let title = t(story.title)
          title = title
            .replace('<br>', '')
            .replace('<br />', '')
            .replace('<p>', '')
            .replace('</p>', '')
          return (
            <List.Item
              actions={[
                <a key='open-story-info' href={`/story/${slugify(title)}/${story.story_id}`}><InfoIcon /></a>]}
            >
              <span>
                {title}
              </span>
            </List.Item>
          )
        }}
      />
    )
  }
}
