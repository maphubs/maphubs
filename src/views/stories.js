// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Col, Button } from 'antd'
import StorySummary from '../components/Story/StorySummary'
import UserStore from '../stores/UserStore'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {UserStoreState} from '../stores/UserStore'
import ErrorBoundary from '../components/ErrorBoundary'
import FloatingButton from '../components/FloatingButton'

type Props = {|
  popularStories: Array<Object>,
  recentStories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
|}

type State = UserStoreState;

export default class Stories extends MapHubsComponent<Props, State> {
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
    this.stores.push(UserStore)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const {t} = this
    const {recentStories, popularStories} = this.props
    const hasRecent = recentStories && recentStories.length > 0
    const hasPopular = popularStories && popularStories.length > 0
    return (
      <ErrorBoundary>
        <Header activePage='stories' {...this.props.headerConfig} />
        <main>
          <Row style={{padding: '20px'}}>
            {(hasRecent || hasPopular) &&
              <Row style={{textAlign: 'right'}}>
                <Button type='link' href='/stories/all'>{t('View All Stories')}</Button>
              </Row>
            }
            {hasRecent &&
              <Col sm={24} med={12} style={{margin: '20px'}}>
                <Row style={{textAlign: 'center'}}>
                  <h4>{t('Recent Stories')}</h4>
                </Row>
                {recentStories.map((story) => {
                  return (
                    <div className='card' key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                      <div className='card-content'>
                        <StorySummary story={story} />
                      </div>
                    </div>
                  )
                })}
              </Col>
            }
            {hasPopular &&
              <Col sm={24} med={12} style={{margin: '20px'}}>
                <Row style={{textAlign: 'center'}}>
                  <h4>{t('Popular Stories')}</h4>
                </Row>
                {popularStories.map((story) => {
                  return (
                    <div className='card' key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                      <div className='card-content'>
                        <StorySummary story={story} />
                      </div>
                    </div>
                  )
                })}
              </Col>
            }
            {(!hasRecent && !hasPopular) &&
              <div className='col s12' style={{height: '400px', textAlign: 'center', paddingTop: '200px'}}>
                <b>{t('No Stories Found')}</b>
              </div>
            }
          </Row>
          <div className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createstory'
              icon='add'
              tooltip={t('Create New Story')} tooltipPosition='top' />
          </div>
          
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
