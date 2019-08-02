// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import slugify from 'slugify'

type Props = {|
  stories: Array<Object>,
  showTitle: boolean
|}

export default class StoryList extends MapHubsComponent<Props, void> {
  static defaultProps = {
    showTitle: true
  }

  shouldComponentUpdate (nextProps: Props) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  render () {
    const {t} = this
    const { showTitle } = this.props

    return (
      <ul className={showTitle ? 'collection with-header' : 'collection'}>
        {showTitle &&
          <li className='collection-header'>
            <h4>{t('Stories')}</h4>
          </li>
        }
        {this.props.stories.map((story, i) => {
          let title = t(story.title)
          title = title
            .replace('<br>', '')
            .replace('<br />', '')
            .replace('<p>', '')
            .replace('</p>', '')
          const storyUrl = `/story/${slugify(title)}/${story.story_id}`
          return (
            <li className='collection-item' key={story.story_id}>
              <div>{title}
                <a className='secondary-content' href={storyUrl}>
                  <i className='material-icons'>info</i>
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
