// @flow
import React from 'react'
import slugify from 'slugify'
import StoryHeader from './StoryHeader'
import MapHubsComponent from '../../components/MapHubsComponent'
import ShareButtons from '../../components/ShareButtons'
import urlUtil from '../../services/url-util'

type Props = {|
  story: Object,
  baseUrl: string
|}

export default class StorySummary extends MapHubsComponent<Props, void> {
  static defaultProps = {
    baseUrl: ''
  }

  render () {
    const {t} = this
    const {story} = this.props
    let title = ''
    if (story.title) {
      title = story.title.replace('&nbsp;', '')
    }
    let linkUrl = ''
    const baseUrl = urlUtil.getBaseUrl()
    if (story.display_name) {
      linkUrl = `${baseUrl}/user/${story.display_name}`
    } else if (story.hub_id) {
      const hubUrl = `${baseUrl}/hub/${story.hub_id}`
      linkUrl = hubUrl
    }

    linkUrl += `/story/${story.story_id}/${slugify(title)}`

    let imageUrl
    if (story.firstimage) {
      imageUrl = story.firstimage.replace(/\/image\//i, '/thumbnail/')
      if (imageUrl.startsWith(baseUrl)) {
        imageUrl = imageUrl.replace(baseUrl, '')
      }
      imageUrl = '/img/resize/1200?url=' + imageUrl
    }

    return (
      <div>
        <StoryHeader story={story} baseUrl={this.props.baseUrl} />
        {story.firstimage &&
          <div>
            <a href={linkUrl}>
              <div style={{height: '160px', width: '100%', backgroundImage: 'url(' + imageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center'}} />
            </a>
          </div>
        }
        <a href={linkUrl}>
          <h5 className='grey-text text-darken-4 story-title'>{title}</h5>
        </a>
        <div className='story-content'>
          <p className='fade'>
            {story.firstline}
          </p>
        </div>
        <a href={linkUrl} style={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)'}}>
          {t('Read more...')}
        </a>
        {!story.published &&
          <p style={{position: 'absolute', top: '15px', left: '50%', right: '50%'}}>
            <b style={{color: 'red', textTransform: 'uppercase'}}>{t('Draft')}</b>
          </p>
        }
        <ShareButtons
          title={story.title} t={t}
          style={{width: '70px', position: 'absolute', right: '10px', bottom: '10px'}}
        />
      </div>
    )
  }
}
