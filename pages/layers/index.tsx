import React from 'react'
import Layout from '../../src/components/Layout'
import { useRouter } from 'next/router'
import { Row, Button, Typography } from 'antd'
import CardCollection from '../../src/components/CardCarousel/CardCollection'
import CardSearch from '../../src/components/CardCarousel/CardSearch'
import type { Layer } from '../../src/types/layer'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingAddButton from '../../src/components/FloatingAddButton'
import cardUtil from '../../src/services/card-util'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import useT from '../../src/hooks/useT'
const { Title } = Typography

const Layers = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()

  const { data } = useSWR(`
  {
    featuredLayers(limit: 25) {
      layer_id
      shortid
      name
      description
      source
    }
    recentLayers(limit: 25) {
      layer_id
      shortid
      name
      description
      source
    }
    popularLayers(limit: 25) {
      layer_id
      shortid
      name
      description
      source
    }
  }
  `)
  const stickyData: {
    featuredLayers: Layer[]
    recentLayers: Layer[]
    popularLayers: Layer[]
  } = useStickyResult(data) || {}
  const { featuredLayers, recentLayers, popularLayers } = stickyData

  const featuredCards = featuredLayers
    ? featuredLayers.map((layer) => cardUtil.getLayerCard(layer))
    : []
  const recentCards = recentLayers
    ? recentLayers.map((layer) => cardUtil.getLayerCard(layer))
    : []
  const popularCards = popularLayers
    ? popularLayers.map((layer) => cardUtil.getLayerCard(layer))
    : []
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Layers')} activePage='layers'>
        <div
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
          <CardSearch cardType='layer' />
          {featuredCards.length > 0 && (
            <CardCollection
              title={t('Featured')}
              cards={featuredCards}
              viewAllLink='/layers/all'
            />
          )}
          <CardCollection
            title={t('Popular')}
            cards={popularCards}
            viewAllLink='/layers/all'
          />
          <CardCollection
            title={t('Recent')}
            cards={recentCards}
            viewAllLink='/layers/all'
          />

          <FloatingAddButton
            onClick={() => {
              router.push('/createlayer')
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
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default Layers
