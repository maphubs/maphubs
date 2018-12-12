// @flow
import React from 'react'
import HubNav from '../components/Hub/HubNav'
import HubBanner from '../components/Hub/HubBanner'
import HubStore from '../stores/HubStore'
import StoryHeader from '../components/Story/StoryHeader'
import Comments from '../components/Comments'
import slugify from 'slugify'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ShareButtons from '../components/ShareButtons'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

type Props = {
  story: Object,
  hub: Object,
  canEdit: boolean,
  locale: string,
  _csrf: string,
  user: Object
}

export default class HubStory extends MapHubsComponent<Props, void> {
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
    hub: {},
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(HubStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(HubStore, {hub: this.props.hub, canEdit: this.props.canEdit})
  }

  render () {
    const {t} = this
    const story = this.props.story
    const title = story.title.replace('&nbsp;', '')
    let button = ''
    const baseUrl = '/hub/' + this.props.hub.hub_id
    if (this.props.canEdit) {
      button = (
        <div className='fixed-action-btn action-button-bottom-right'>
          <FloatingButton icon='mode_edit'
            href={`${baseUrl}/story/${this.props.story.story_id}/edit/${slugify(title)}`}
            tooltip={t('Edit')} tooltipPosition='left' />
        </div>
      )
    }

    let discuss = ''
    let shareButtons = ''
    if (MAPHUBS_CONFIG.enableComments) {
      shareButtons = (
        <ShareButtons
          title={story.title} t={this.t}
          style={{width: '70px', position: 'absolute', right: '10px'}}
        />
      )
      discuss = (
        <div className='row'>
          <Comments />
        </div>
      )
    }

    /* eslint-disable react/no-danger */
    return (
      <ErrorBoundary>
        <HubNav hubid={this.props.hub.hub_id} />
        <main>
          <div className='row'>
            <HubBanner subPage />
          </div>
          <div className='container'>
            <div className='row' style={{marginTop: '20px'}}>
              <div className='col s12 m19 l9'>
                <StoryHeader story={story} />
              </div>
              <div className='col s12 m3 l3'>
                {shareButtons}
              </div>
            </div>
            <div className='row'>
              <h3 className='story-title'>{title}</h3>
              <div className='story-content' dangerouslySetInnerHTML={{__html: story.body}} />
            </div>
            <hr />
            {discuss}
          </div>
          {button}
        </main>
      </ErrorBoundary>
    )
    /* eslint-enable react/no-danger */
  }
}
