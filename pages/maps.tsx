import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../src/components/CardCarousel/CardCollection'
import CardSearch from '../src/components/CardCarousel/CardSearch'
import ErrorBoundary from '../src/components/ErrorBoundary'
import FloatingAddButton from '../src/components/FloatingAddButton'
import cardUtil from '../src/services/card-util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography
type Props = {
  featuredMaps: Array<Record<string, any>>
  recentMaps: Array<Record<string, any>>
  popularMaps: Array<Record<string, any>>
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  searchResults: Array<Record<string, any>>
  searchActive: boolean
}
export default class Maps extends React.Component<Props, State> {
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

  render(): JSX.Element {
    const { t, props } = this
    const {
      featuredMaps,
      recentMaps,
      popularMaps,
      headerConfig,
      footerConfig
    } = props
    const featuredCards = featuredMaps.map((map) => cardUtil.getMapCard(map))
    const recentCards = recentMaps.map((map) => cardUtil.getMapCard(map))
    const popularCards = popularMaps.map((map) => cardUtil.getMapCard(map))
    return (
      <ErrorBoundary t={t}>
        <Header activePage='maps' {...headerConfig} />
        <main
          style={{
            margin: '10px'
          }}
        >
          <div
            style={{
              marginTop: '20px',
              marginBottom: '10px'
            }}
          >
            <Row>
              <Title level={2}>{t('Maps')}</Title>
            </Row>
          </div>
          <CardSearch cardType='map' t={t} />
          {!MAPHUBS_CONFIG.mapHubsPro &&
            featuredCards &&
            featuredCards.length > 0 && (
              <CardCollection
                title={t('Featured')}
                cards={featuredCards}
                viewAllLink='/maps/all'
                t={t}
              />
            )}
          <CardCollection
            title={t('Popular')}
            cards={popularCards}
            viewAllLink='/maps/all'
            t={t}
          />
          <CardCollection
            title={t('Recent')}
            cards={recentCards}
            viewAllLink='/maps/all'
            t={t}
          />
          <FloatingAddButton
            onClick={() => {
              window.location.assign('/map/new')
            }}
            tooltip={t('Create New Map')}
          />
          <Row
            justify='center'
            style={{
              textAlign: 'center'
            }}
          >
            <Button type='primary' href='/maps/all'>
              {t('View All Maps')}
            </Button>
          </Row>
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
