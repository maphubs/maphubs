// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Col, Typography } from 'antd'
import CardSearch from '../components/CardCarousel/CardSearch'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import MapList from '../components/Lists/MapList'
import Toggle from '../components/forms/toggle'
import Formsy from 'formsy-react'
import CardGrid from '../components/CardCarousel/CardGrid'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'

import cardUtil from '../services/card-util'
const { Title } = Typography

type Props = {
  maps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  showList: boolean
}

export default class AllMaps extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State = {
    showList: false
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  onModeChange = (showList: boolean) => {
    this.setState({showList})
  }

  render () {
    const {t} = this
    const { maps } = this.props
    const { showList } = this.state

    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <div style={{marginTop: '20px', marginBottom: '10px'}}>
            <Row>
              <Title level={2}>{t('Maps')}</Title>
            </Row>
          </div>
          <CardSearch cardType='map' t={t} />
          <Row justify='end' style={{marginBottom: '20px'}}>
            <Col style={{margin: '20px'}}>
              <Formsy>
                <Toggle name='mode' onChange={this.onModeChange} labelOff={t('Grid')} labelOn={t('List')} checked={showList} />
              </Formsy>
            </Col>
            <Row style={{marginBottom: '20px'}}>
              {showList &&
                <div className='container'>
                  <MapList showTitle={false} maps={maps} t={t} />
                </div>}
              {!showList &&
                <CardGrid cards={maps.map(cardUtil.getMapCard)} t={t} />}
            </Row>
          </Row>
          <div>
            <FloatingAddButton
              onClick={() => {
                window.location = '/map/new'
              }}
              tooltip={t('Create New Map')}
            />
          </div>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
