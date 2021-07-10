import React from 'react'
import Header from '../src/components/header'
import StoryEditor from '../src/components/Story/StoryEditor'
import ErrorBoundary from '../src/components/ErrorBoundary'

import { Provider } from 'unstated'
import StoryContainer from '../src/components/Story/StoryContainer'

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

export default class EditStory extends React.Component<Props> {
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

    this.StoryContainer = new StoryContainer({
      _csrf: props._csrf,
      ...props.story
    })
  }

  render(): JSX.Element {
    const { t, props, state } = this
    const { headerConfig, myMaps, popularMaps, groups } = props
    const { locale } = state
    return (
      <ErrorBoundary t={t}>
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
              t={t}
              locale={locale}
            />
          </Provider>
        </main>
      </ErrorBoundary>
    )
  }
}
