import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../src/components/CardCarousel/CardCollection'
import CardSearch from '../src/components/CardCarousel/CardSearch'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import FloatingAddButton from '../src/components/FloatingAddButton'
import cardUtil from '../services/card-util'
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
    const { t } = this
    const featuredCards = this.props.featuredMaps.map(cardUtil.getMapCard)
    const recentCards = this.props.recentMaps.map(cardUtil.getMapCard)
    const popularCards = this.props.popularMaps.map(cardUtil.getMapCard)
    return (
      <ErrorBoundary>
        <Header activePage='maps' {...this.props.headerConfig} />
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
              />
            )}
          <CardCollection
            title={t('Popular')}
            cards={popularCards}
            viewAllLink='/maps/all'
          />
          <CardCollection
            title={t('Recent')}
            cards={recentCards}
            viewAllLink='/maps/all'
          />
          <FloatingAddButton
            onClick={() => {
              window.location = '/map/new'
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
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
