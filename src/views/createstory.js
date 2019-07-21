// @flow
import React from 'react'
import Header from '../components/header'
import StoryEditor from '../components/Story/StoryEditor'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import { Provider } from 'unstated'
import StoryContainer from '../components/Story/StoryContainer'

import type {LocaleStoreState} from '../stores/LocaleStore'

type Props = {
  story_id: number,
  username: string,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  groups: Array<Object>,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

type State = LocaleStoreState

export default class CreateStory extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  StoryContainer: any

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.StoryContainer = new StoryContainer({
      _csrf: props._csrf
    })
  }

  render () {
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <Provider inject={[this.StoryContainer]} >
            <StoryEditor
              myMaps={this.props.myMaps}
              popularMaps={this.props.popularMaps}
              groups={this.props.groups}
              create
              t={this.t}
              locale={this.state.locale}
            />
          </Provider>
        </main>
      </ErrorBoundary>
    )
  }
}
