// @flow
import React from 'react'
import HubNav from '../components/Hub/HubNav'
import HubBanner from '../components/Hub/HubBanner'
import StoryEditor from '../components/Story/StoryEditor'
import Notification from '../components/Notification'
import Message from '../components/message'
import Confirmation from '../components/confirmation'
import HubStore from '../stores/HubStore'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  story: Object,
  hub: Object,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  user: Object
}

export default class EditHubStory extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    story: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(HubStore)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(HubStore, {hub: props.hub})
  }

  render () {
    return (
      <ErrorBoundary>
        <HubNav hubid={this.props.hub.hub_id} />
        <main>
          <div className='row no-margin'>
            <HubBanner editing={false} subPage />
          </div>
          <div className='row no-margin'>
            <StoryEditor story={this.props.story}
              myMaps={this.props.myMaps}
              popularMaps={this.props.popularMaps}
              storyType='hub' hub_id={this.props.hub.hub_id} />
          </div>
          <Notification />
          <Message />
          <Confirmation />
        </main>
      </ErrorBoundary>
    )
  }
}
