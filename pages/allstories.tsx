import React from 'react'
import { Row, Typography } from 'antd'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import UserStore from '../src/stores/UserStore'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import StoryList from '../src/components/Lists/StoryList'
import type { UserStoreState } from '../src/stores/UserStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import FloatingAddButton from '../src/components/FloatingAddButton'
const { Title } = Typography
type Props = {
  stories: Array<Record<string, any>>
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = UserStoreState
export default class AllStories extends React.Component<Props, State> {
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
        stories: Array<any>
      } = {
    stories: []
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore]
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }
  }

  render(): JSX.Element {
    const { t, props } = this
    const { stories, headerConfig, footerConfig } = props
    const hasStories = stories && stories.length > 0
    return (
      <ErrorBoundary>
        <Header activePage='stories' {...headerConfig} />
        <main
          style={{
            padding: '10px'
          }}
        >
          <div
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Row>
              <Title>{t('Stories')}</Title>
            </Row>
            {hasStories && (
              <Row>
                <div className='container'>
                  <StoryList showTitle={false} stories={stories} t={t} />
                </div>
              </Row>
            )}
            {!hasStories && (
              <Row
                style={{
                  height: '400px',
                  textAlign: 'center',
                  paddingTop: '200px'
                }}
              >
                <b>{t('No Stories Found')}</b>
              </Row>
            )}
          </div>
          <FloatingAddButton
            onClick={() => {
              window.location = '/createstory'
            }}
            tooltip={t('Create New Story')}
          />
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
