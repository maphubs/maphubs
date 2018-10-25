// @flow
import React from 'react'
import Header from '../components/header'
import Comments from '../components/Comments'
import slugify from 'slugify'
import StoryHeader from '../components/Story/StoryHeader'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ShareButtons from '../components/ShareButtons'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

type Props = {
  story: Object,
  username: string,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

export default class UserStory extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    story: {},
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const story = this.props.story

    let button = ''
    if (this.props.canEdit) {
      button = (
        <div className='fixed-action-btn action-button-bottom-right'>
          <FloatingButton
            href={`/user/${this.props.username}/story/${this.props.story.story_id}/edit/${slugify(this.props.story.title)}`}
            tooltip={this.__('Edit')}
            tooltipPosition='left'
            icon='mode_edit' />
        </div>
      )
    }
    const title = story.title.replace('&nbsp;', '')

    let shareAndDiscuss = ''
    if (MAPHUBS_CONFIG.enableComments) {
      shareAndDiscuss = (
        <div className='story-share-comments'>
          <div className='row' style={{height: '32px', position: 'relative'}}>
            <ShareButtons
              title={story.title} t={this.t}
              style={{width: '70px', position: 'absolute', left: '0px'}}
            />
          </div>
          <div className='row'>
            <Comments />
          </div>
        </div>
      )
    }

    /* eslint-disable react/no-danger */
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container'>
            <div className='row' style={{marginTop: '20px'}}>
              <div className='col s12 m19 l9'>
                <StoryHeader story={story} />
              </div>
              <div className='col s12 m3 l3'>
                <ShareButtons
                  title={story.title} t={this.t}
                  style={{width: '70px', position: 'absolute', right: '10px'}}
                />
              </div>
            </div>
            <div className='row'>
              <h3 className='story-title'>{title}</h3>
              <div className='story-content' dangerouslySetInnerHTML={{__html: story.body}} />
            </div>
            <hr />
            {shareAndDiscuss}

          </div>
          {button}
        </main>
      </ErrorBoundary>
    )
    /* eslint-enable react/no-danger */
  }
}
