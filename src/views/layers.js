// @flow
import type {Node} from "React";import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../components/CardCarousel/CardCollection'
import CardSearch from '../components/CardCarousel/CardSearch'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {Layer} from '../types/layer'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingAddButton from '../components/FloatingAddButton'
import cardUtil from '../services/card-util'

const { Title } = Typography

type Props = {
  featuredLayers: Array<Layer>,
  recentLayers: Array<Layer>,
  popularLayers: Array<Layer>,
  locale: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

export default class Layers extends MapHubsComponent<Props, void> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
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

  render (): Node {
    const {t} = this
    const featuredCards = this.props.featuredLayers.map(cardUtil.getLayerCard)
    const recentCards = this.props.recentLayers.map(cardUtil.getLayerCard)
    const popularCards = this.props.popularLayers.map(cardUtil.getLayerCard)

    return (
      <ErrorBoundary>
        <Header activePage='layers' {...this.props.headerConfig} />
        <main style={{margin: '10px'}}>
          <Row style={{marginTop: '20px', marginBottom: '10px'}}>
            <Title level={2}>{t('Layers')}</Title>
          </Row>
          <CardSearch cardType='layer' t={t} />
          {featuredCards.length > 0 &&
            <CardCollection title={t('Featured')} cards={featuredCards} viewAllLink='/layers/all' />}
          <CardCollection title={t('Popular')} cards={popularCards} viewAllLink='/layers/all' />
          <CardCollection title={t('Recent')} cards={recentCards} viewAllLink='/layers/all' />

          <FloatingAddButton
            onClick={() => {
              window.location = '/createlayer'
            }}
            tooltip={t('Create New Layer')}
          />
          <Row justify='center' style={{paddingBottom: '20px', textAlign: 'center'}}>
            <Button type='primary' href='/layers/all'>{t('View All Layers')}</Button>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
