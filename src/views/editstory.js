// @flow
import React from 'react'
import Header from '../components/header'
import StoryEditor from '../components/Story/StoryEditor'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import { Provider } from 'unstated'
import StoryContainer from '../components/Story/StoryContainer'

type Props = {|
  story: Object,
  myMaps: Array<Object>,
  popularMaps: Array<Object>,
  groups: Array<Object>,
  username: string,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
|}

type State = LocaleStoreState

export default class EditStory extends MapHubsComponent<Props, State> {
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

  StoryContainer: any

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.StoryContainer = new StoryContainer({
      _csrf: props._csrf,
      ...props.story
    })
  }

  render () {
    const { headerConfig, myMaps, popularMaps, groups } = this.props
    return (
      <ErrorBoundary>
        <Header {...headerConfig} />
        <main style={{height: 'calc(100% - 50px)'}}>
          <Provider inject={[this.StoryContainer]} >
            <StoryEditor
              myMaps={myMaps}
              popularMaps={popularMaps}
              groups={groups}
              t={this.t}
              locale={this.state.locale}
            />
          </Provider>
        </main>
      </ErrorBoundary>
    )
  }
}
