// @flow
import React from 'react'
import Header from '../components/header'
import StoryEditor from '../components/Story/StoryEditor'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {|
  story: Object,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  username: string,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
|}

export default class EditStory extends MapHubsComponent<Props, void> {
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
          <StoryEditor
            story={this.props.story}
            myMaps={this.props.myMaps}
            popularMaps={this.props.popularMaps}
            username={this.props.username}
            storyType='user' />
        </main>
      </ErrorBoundary>
    )
  }
}
