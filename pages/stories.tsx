import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Col, Button, Typography, Card } from 'antd'
import StorySummary from '../src/components/Story/StorySummary'
import UserStore from '../src/stores/UserStore'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import type { UserStoreState } from '../src/stores/UserStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import FloatingAddButton from '../src/components/FloatingAddButton'
import { Story } from '../src/types/story'
const { Title } = Typography
type Props = {
  popularStories: Story[]
  recentStories: Story[]
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
    const { recentStories, popularStories, headerConfig, footerConfig } = props
    const hasRecent = recentStories && recentStories.length > 0
    const hasPopular = popularStories && popularStories.length > 0
    return (
      <ErrorBoundary>
        <Header activePage='stories' {...headerConfig} />
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
                md={12}
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
                md={12}
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
              window.location.assign('/createstory')
            }}
            tooltip={t('Create New Story')}
          />
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
