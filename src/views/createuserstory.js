// @flow
import React from 'react'
import Header from '../components/header'
import StoryEditor from '../components/Story/StoryEditor'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  story_id: number,
  username: string,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

export default class CreateUserStory extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <StoryEditor storyType='user'
            story={{story_id: this.props.story_id, published: false}}
            myMaps={this.props.myMaps}
            popularMaps={this.props.popularMaps}
            username={this.props.username} />
        </main>

      </ErrorBoundary>
    )
  }
}
