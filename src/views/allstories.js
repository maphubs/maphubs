// @flow
import type {Node} from "React";import React from 'react'
import { Row, Typography } from 'antd'
import Header from '../components/header'
import Footer from '../components/footer'
import UserStore from '../stores/UserStore'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import StoryList from '../components/Lists/StoryList'
import type {UserStoreState} from '../stores/UserStore'
import ErrorBoundary from '../components/ErrorBoundary'
import FloatingAddButton from '../components/FloatingAddButton'

const { Title } = Typography

type Props = {|
  stories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
|}

type State = UserStoreState

export default class AllStories extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: any | {|stories: Array<any>|} = {
    stories: []
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render (): Node {
    const {t} = this
    const {stories} = this.props
    const hasStories = stories && stories.length > 0
    return (
      <ErrorBoundary>
        <Header activePage='stories' {...this.props.headerConfig} />
        <main style={{padding: '10px'}}>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <Title>{t('Stories')}</Title>
            </Row>
            {hasStories &&
              <Row>
                <div className='container'>
                  <StoryList showTitle={false} stories={stories} t={t} />
                </div>
              </Row>}
            {!hasStories &&
              <Row style={{height: '400px', textAlign: 'center', paddingTop: '200px'}}>
                <b>{t('No Stories Found')}</b>
              </Row>}

          </div>
          <FloatingAddButton
            onClick={() => {
              window.location = '/createstory'
            }}
            tooltip={t('Create New Story')}
          />
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
