// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import StorySummary from '../components/Story/StorySummary'
import MessageActions from '../actions/MessageActions'
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

  onCreateStory = () => {
    const {t} = this
    const {user} = this.state
    if (user && user.display_name) {
      window.location = `/user/${user.display_name}/stories`
    } else {
      MessageActions.showMessage({title: 'Login Required', message: t('Please login to your account or register for an account.')})
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
          <div>
            <div className='row'>
              {hasRecent &&
                <div className='col s12 m12 l6'>
                  <h4>{t('Recent Stories')}</h4>
                  {recentStories.map((story) => {
                    return (
                      <div className='card' key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                        <div className='card-content'>
                          <StorySummary story={story} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              }
              {hasPopular &&
                <div className='col s12 m12 l6'>
                  <h4>{t('Popular Stories')}</h4>
                  {popularStories.map((story) => {
                    return (
                      <div className='card' key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                        <div className='card-content'>
                          <StorySummary story={story} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              }
              {(!hasRecent && !hasPopular) &&
                <div className='col s12' style={{height: '400px', textAlign: 'center', paddingTop: '200px'}}>
                  <b>{t('No Stories Found')}</b>
                </div>
              }
            </div>
          </div>
          <div className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              onClick={this.onCreateStory} icon='add'
              tooltip={t('Create New Story')} tooltipPosition='top' />
          </div>
          {(hasRecent || hasPopular) &&
            <div className='row center-align'>
              <a className='btn' href='/stories/all'>{t('View All Stories')}</a>
            </div>
          }
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
