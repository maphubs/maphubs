import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Col, Button, Typography, Card } from 'antd'
import StorySummary from '../components/Story/StorySummary'
import UserStore from '../stores/UserStore'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type { UserStoreState } from '../stores/UserStore'
import ErrorBoundary from '../components/ErrorBoundary'
import FloatingAddButton from '../components/FloatingAddButton'
const { Title } = Typography
type Props = {
  popularStories: Array<Record<string, any>>
  recentStories: Array<Record<string, any>>
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = UserStoreState
export default class Stories extends React.Component<Props, State> {
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

  constructor(props: Props) {
    super(props)
    this.stores.push(UserStore)
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
    const { t } = this
    const { recentStories, popularStories } = this.props
    const hasRecent = recentStories && recentStories.length > 0
    const hasPopular = popularStories && popularStories.length > 0
    return (
      <ErrorBoundary>
        <Header activePage='stories' {...this.props.headerConfig} />
        <main>
          <Row
            style={{
              padding: '20px'
            }}
          >
            {(hasRecent || hasPopular) && (
              <Row
                justify='end'
                style={{
                  textAlign: 'right'
                }}
              >
                <Button type='link' href='/stories/all'>
                  {t('View All Stories')}
                </Button>
              </Row>
            )}
            {hasRecent && (
              <Col
                sm={24}
                med={12}
                style={{
                  margin: '20px'
                }}
              >
                <Row
                  justify='center'
                  style={{
                    textAlign: 'center'
                  }}
                >
                  <Title level={2}>{t('Recent Stories')}</Title>
                </Row>
                {recentStories.map((story) => {
                  return (
                    <Card
                      key={story.story_id}
                      style={{
                        maxWidth: '800px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginBottom: '20px',
                        border: '1px solid #ddd'
                      }}
                    >
                      <StorySummary story={story} t={t} />
                    </Card>
                  )
                })}
              </Col>
            )}
            {hasPopular && (
              <Col
                sm={24}
                med={12}
                style={{
                  margin: '20px'
                }}
              >
                <Row
                  justify='center'
                  style={{
                    textAlign: 'center'
                  }}
                >
                  <Title level={2}>{t('Popular Stories')}</Title>
                </Row>
                {popularStories.map((story) => {
                  return (
                    <Card
                      key={story.story_id}
                      style={{
                        maxWidth: '800px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        marginBottom: '20px'
                      }}
                    >
                      <StorySummary story={story} t={t} />
                    </Card>
                  )
                })}
              </Col>
            )}
            {!hasRecent && !hasPopular && (
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
          </Row>
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
