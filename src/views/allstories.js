// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import MessageActions from '../actions/MessageActions'
import UserStore from '../stores/UserStore'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import StoryList from '../components/Lists/StoryList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import cardUtil from '../services/card-util'
import type {UserStoreState} from '../stores/UserStore'
import ErrorBoundary from '../components/ErrorBoundary'
import FloatingButton from '../components/FloatingButton'

type Props = {|
  stories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
|}

type State = {
  showList?: boolean
} & UserStoreState;

export default class AllStories extends MapHubsComponent<Props, State> {
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

  componentDidMount () {
    M.FloatingActionButton.init(this.refs.addButton, {})
  }

  onCreateStory = () => {
    const {t} = this
    if (this.state.user && this.state.user.display_name) {
      window.location = '/user/' + this.state.user.display_name + '/stories'
    } else {
      MessageActions.showMessage({title: 'Login Required', message: t('Please login to your account or register for an account.')})
    }
  }

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    const {stories} = this.props
    const {showList} = this.state

    return (
      <ErrorBoundary>
        <Header activePage='stories' {...this.props.headerConfig} />
        <main>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <div className='row' style={{marginBottom: '0px'}}>
              <div className='col l8 m7 s12'>
                <h4 className='no-margin'>{t('Stories')}</h4>
              </div>
            </div>
            <div className='row'>
              <div className='left-align' style={{marginLeft: '15px', marginTop: '25px'}}>
                <Formsy>
                  <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={showList} />
                </Formsy>
              </div>
              <div className='row'>
                {showList &&
                  <div className='container'>
                    <StoryList showTitle={false} stories={stories} />
                  </div>
                }
                {!showList &&
                  <CardGrid cards={stories.map(cardUtil.getStoryCard)} t={t} />
                }
              </div>
            </div>
          </div>
          <div ref='addButton' className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              onClick={this.onCreateStory}
              tooltip={t('Create New Story')}
              tooltipPosition='top'
              icon='add' />
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
