// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row } from 'antd'
import StorySummary from '../components/Story/StorySummary'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'

type Props = {
  stories: Array<Object>,
  myStories?: boolean,
  username: string,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type DefaultProps = {
  stories: Array<Object>
}

export default class UserStories extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: DefaultProps = {
    stories: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const {t} = this
    const {myStories, stories, username} = this.props

    return (
      <ErrorBoundary>
        <Header activePage='mystories' {...this.props.headerConfig} />
        <main style={{minHeight: 'calc(100% - 70px)'}}>
          <div className='container' style={{height: '100%'}}>
            {(!stories || stories.length === 0) &&
              <Row style={{height: 'calc(100% - 100px)'}}>
                <div className='valign-wrapper' style={{height: '100%'}}>
                  <div className='valign align-center center-align' style={{width: '100%'}}>
                    <h5>{t('Click the button below to create your first story')}</h5>
                  </div>
                </div>
              </Row>}
            {stories.map((story) => {
              return (
                <div className='card' key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                  <div className='card-content'>
                    <StorySummary baseUrl={`/user/${username}`} story={story} />
                  </div>
                </div>
              )
            })}
          </div>
          {myStories &&
            <div>
              <div className='fixed-action-btn action-button-bottom-right'>
                <FloatingButton
                  href='/createstory' icon='add'
                  tooltip={t('Create New Story')} tooltipPosition='top'
                />
              </div>
            </div>}
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
