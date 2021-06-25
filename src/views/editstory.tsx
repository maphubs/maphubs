import React from 'react'
import Header from '../components/header'
import StoryEditor from '../components/Story/StoryEditor'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import type { LocaleStoreState } from '../stores/LocaleStore'
import { Provider } from 'unstated'
import StoryContainer from '../components/Story/StoryContainer'
type Props = {
  story: Record<string, any>
  myMaps: Array<Record<string, any>>
  popularMaps: Array<Record<string, any>>
  groups: Array<Record<string, any>>
  username: string
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = LocaleStoreState
export default class EditStory extends React.Component<Props, State> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps:
    | any
    | {
        story: {}
      } = {
    story: {}
  }
  StoryContainer: any

  constructor(props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }

    this.StoryContainer = new StoryContainer({
      _csrf: props._csrf,
      ...props.story
    })
  }

  render(): JSX.Element {
    const { headerConfig, myMaps, popularMaps, groups } = this.props
    return (
      <ErrorBoundary>
        <Header {...headerConfig} />
        <main
          style={{
            height: 'calc(100% - 50px)'
          }}
        >
          <Provider inject={[this.StoryContainer]}>
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
