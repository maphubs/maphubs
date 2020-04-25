// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Typography } from 'antd'
import CardSearch from '../components/CardCarousel/CardSearch'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import MapList from '../components/Lists/MapList'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'

const { Title } = Typography

type Props = {
  maps: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

export default class AllMaps extends MapHubsComponent<Props, void> {
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
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  render () {
    const {t} = this
    const { maps } = this.props

    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Title level={2}>{t('Maps')}</Title>
          </Row>
          <CardSearch cardType='map' t={t} />
          <Row justify='center' style={{marginBottom: '20px'}}>
            <MapList showTitle={false} maps={maps} t={t} />
          </Row>
          <FloatingAddButton
            onClick={() => {
              window.location = '/map/new'
            }}
            tooltip={t('Create New Map')}
          />
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
