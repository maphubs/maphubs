// @flow
import React from 'react'
import { Row, Col } from 'antd'
import Header from '../components/header'
import Footer from '../components/footer'
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

  static defaultProps = {
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

  componentDidMount () {
    M.FloatingActionButton.init(this.refs.addButton, {})
  }

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    const {stories} = this.props
    const {showList} = this.state
    const hasStories = stories && stories.length > 0
    return (
      <ErrorBoundary>
        <Header activePage='stories' {...this.props.headerConfig} />
        <main style={{padding: '10px'}}>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <h4 className='no-margin'>{t('Stories')}</h4>
            </Row>
            <Row justify='end'>
              <Col style={{margin: '20px'}}>
                <Formsy>
                  <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={showList} />
                </Formsy>
              </Col>
            </Row>
            {hasStories &&
              <Row>
                {showList &&
                  <div className='container'>
                    <StoryList showTitle={false} stories={stories} />
                  </div>}
                {!showList &&
                  <CardGrid cards={stories.map(s => cardUtil.getStoryCard(s, t))} t={t} />}
              </Row>}
            {!hasStories &&
              <Row style={{height: '400px', textAlign: 'center', paddingTop: '200px'}}>
                <b>{t('No Stories Found')}</b>
              </Row>}

          </div>
          <div ref='addButton' className='fixed-action-btn action-button-bottom-right'>
            <FloatingButton
              href='/createstory'
              tooltip={t('Create New Story')}
              tooltipPosition='top'
              icon='add'
            />
          </div>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
