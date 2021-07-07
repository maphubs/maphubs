import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../src/components/CardCarousel/CardCollection'
import CardSearch from '../src/components/CardCarousel/CardSearch'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import type { Layer } from '../src/types/layer'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import FloatingAddButton from '../src/components/FloatingAddButton'
import cardUtil from '../src/services/card-util'
const { Title } = Typography
type Props = {
  featuredLayers: Array<Layer>
  recentLayers: Array<Layer>
  popularLayers: Array<Layer>
  locale: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  _csrf: string
  user: Record<string, any>
}
export default class Layers extends React.Component<Props> {
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

  constructor(props: Props) {
    super(props)
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
    const {
      featuredLayers,
      recentLayers,
      popularLayers,
      headerConfig,
      footerConfig
    } = props
    const featuredCards = featuredLayers.map((layer) =>
      cardUtil.getLayerCard(layer)
    )
    const recentCards = recentLayers.map((layer) =>
      cardUtil.getLayerCard(layer)
    )
    const popularCards = popularLayers.map((layer) =>
      cardUtil.getLayerCard(layer)
    )
    return (
      <ErrorBoundary>
        <Header activePage='layers' {...headerConfig} />
        <main
          style={{
            margin: '10px'
          }}
        >
          <Row
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Title level={2}>{t('Layers')}</Title>
          </Row>
          <CardSearch cardType='layer' t={t} />
          {featuredCards.length > 0 && (
            <CardCollection
              title={t('Featured')}
              cards={featuredCards}
              viewAllLink='/layers/all'
              t={t}
            />
          )}
          <CardCollection
            title={t('Popular')}
            cards={popularCards}
            viewAllLink='/layers/all'
            t={t}
          />
          <CardCollection
            title={t('Recent')}
            cards={recentCards}
            viewAllLink='/layers/all'
            t={t}
          />

          <FloatingAddButton
            onClick={() => {
              window.location.assign('/createlayer')
            }}
            tooltip={t('Create New Layer')}
          />
          <Row
            justify='center'
            style={{
              paddingBottom: '20px',
              textAlign: 'center'
            }}
          >
            <Button type='primary' href='/layers/all'>
              {t('View All Layers')}
            </Button>
          </Row>
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
