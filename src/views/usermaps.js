// @flow
import React from 'react'
import { Row, Result, Button, Typography } from 'antd'
import MapIcon from '@material-ui/icons/Map'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { Title } = Typography

type Props = {
  maps: Array<Object>,
  user: Object,
  myMaps: boolean,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

export default class UserMaps extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    maps: [],
    user: {},
    myMaps: false
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
    const { myMaps, maps } = this.props

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 70px)', padding: '10px'}}>
          {(!maps || maps.length === 0) &&
            <Row style={{height: 'calc(100% - 100px)', marginBottom: '20px'}}>
              <Result
                style={{margin: 'auto'}}
                icon={<MapIcon style={{color: MAPHUBS_CONFIG.primaryColor, fontSize: '72px'}} />}
                title={t('Click the button below to create your first map')}
                extra={<Button type='primary' href='/map/new'>{t('Create a Map')}</Button>}
              />
            </Row>}
          {(maps && maps.length > 0) &&
            <Row style={{marginBottom: '20px'}}>
              <Title level={2}>{t('My Maps')}</Title>
              <CardCarousel infinite={false} cards={maps.map(cardUtil.getMapCard)} t={this.t} />
            </Row>}
          {myMaps &&
            <FloatingButton
              onClick={() => {
                window.location = '/map/new'
              }}
              tooltip={t('Create New Map')}
            />}
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
