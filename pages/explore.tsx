import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../src/components/Layout'
import SearchBox from '../src/components/SearchBox'
import CardCarousel from '../src/components/CardCarousel/CardCarousel'
import _shuffle from 'lodash.shuffle'
import CardFilter from '../src/components/Home/CardFilter'
import cardUtil from '../src/services/card-util'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { Row, Col, Button, Divider, Typography } from 'antd'
import { Layer } from '../src/types/layer'
import useT from '../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../src/hooks/useStickyResult'
import { Story } from '../src/types/story'
import { Map } from '../src/types/map'
import { Group } from '../src/types/group'

const { Title } = Typography

const Explore = (): JSX.Element => {
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
    recentStories(limit: 25) {
      story_id
      title
      firstimage
      summary
      author
      owned_by_group_id
      groupname
      published
      published_at
    }
    featuredStories(limit: 25) {
      story_id
      title
      firstimage
      summary
      author
      owned_by_group_id
      groupname
      published
      published_at
    }
    featuredMaps(limit: 25) {
      map_id
      title
      share_id
      owned_by_group_id
    }
    recentMaps(limit: 25) {
      map_id
      title
      share_id
      owned_by_group_id
    }
    featuredGroups(limit: 25) {
      group_id
      name
      description
    }
    recentGroups(limit: 25) {
      group_id
      name
      description
    }
  }
  `)
  const stickyData: {
    featuredStories: Story[]
    recentStories: Story[]
    featuredMaps: Map[]
    recentMaps: Map[]
    featuredLayers: Layer[]
    recentLayers: Layer[]
    popularLayers: Layer[]
    featuredGroups: Group[]
    recentGroups: Group[]
  } = useStickyResult(data) || {}
  const {
    featuredStories,
    recentStories,
    featuredMaps,
    recentMaps,
    featuredLayers,
    recentLayers,
    popularLayers,
    featuredGroups,
    recentGroups
  } = stickyData

  const defaultMode = 'recent'
  const [storyMode, setStoryMode] = useState(defaultMode)
  const [mapMode, setMapMode] = useState(defaultMode)
  const [groupMode, setGroupMode] = useState(defaultMode)
  const [layerMode, setLayerMode] = useState(defaultMode)

  const dataMap = {
    stories: {
      featured: featuredStories,
      recent: recentStories
    },
    maps: {
      featured: featuredMaps,
      recent: recentMaps
    },
    groups: {
      featured: featuredGroups,
      recent: recentGroups
    },
    layers: {
      featured: featuredLayers,
      popular: popularLayers,
      recent: recentLayers
    }
  }

  const storyCards = dataMap.stories[storyMode]
    ? _shuffle(
        dataMap.stories[storyMode].map((s) => cardUtil.getStoryCard(s, t))
      )
    : []
  const mapCards = dataMap.maps[mapMode]
    ? _shuffle(dataMap.maps[mapMode].map((m) => cardUtil.getMapCard(m)))
    : []
  const groupCards = dataMap.groups[groupMode]
    ? _shuffle(dataMap.groups[groupMode].map((g) => cardUtil.getGroupCard(g)))
    : []
  const layerCards = dataMap.layers[layerMode]
    ? _shuffle(dataMap.layers[layerMode].map((l) => cardUtil.getLayerCard(l)))
    : []

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Explore')} activePage='explore'>
        <div
          style={{
            margin: 0,
            padding: '10px'
          }}
        >
          <Row
            justify='end'
            style={{
              marginBottom: '20px'
            }}
          >
            <Col sm={24} md={6}>
              <SearchBox
                label={t('Search') + ' ' + process.env.NEXT_PUBLIC_PRODUCT_NAME}
                onSearch={(input: string) => {
                  router.push('/search?q=' + input)
                }}
              />
            </Col>
          </Row>
          <Row
            style={{
              width: '100%',
              marginBottom: '20px'
            }}
          >
            <Row
              style={{
                height: '50px',
                width: '100%',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '5px'
                }}
              >
                <CardFilter
                  value={storyMode}
                  onChange={(value) => {
                    setStoryMode(value)
                  }}
                />
              </div>
              <a href='/stories'>
                <Title level={2}>{t('Stories')}</Title>
              </a>
            </Row>
            <Row
              style={{
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <CardCarousel cards={storyCards} />
            </Row>
            <Row
              justify='center'
              align='middle'
              style={{
                height: '45px',
                width: '100%'
              }}
            >
              <Button type='primary' href='/stories'>
                {t('More Stories')}
              </Button>
            </Row>
          </Row>
          <div className='divider' />
          <Row
            style={{
              width: '100%',
              marginBottom: '20px'
            }}
          >
            <Row
              style={{
                height: '50px',
                width: '100%',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '5px'
                }}
              >
                <CardFilter
                  value={mapMode}
                  onChange={(value) => {
                    setMapMode(value)
                  }}
                />
              </div>
              <a href='/maps'>
                <Title level={2}>{t('Maps')}</Title>
              </a>
            </Row>
            <Row
              style={{
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <CardCarousel cards={mapCards} />
            </Row>
            <Row
              justify='center'
              align='middle'
              style={{
                height: '45px',
                width: '100%'
              }}
            >
              <Button type='primary' href='/maps'>
                {t('More Maps')}
              </Button>
            </Row>
          </Row>
          <div className='divider' />
          <Row
            style={{
              width: '100%',
              marginBottom: '20px'
            }}
          >
            <Row
              style={{
                height: '50px',
                width: '100%',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '5px'
                }}
              >
                <CardFilter
                  value={groupMode}
                  onChange={(value) => {
                    setGroupMode(value)
                  }}
                />
              </div>
              <a href='/groups'>
                <Title level={2}>{t('Groups')}</Title>
              </a>
            </Row>
            <Row
              style={{
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <CardCarousel cards={groupCards} />
            </Row>
            <Row
              justify='center'
              align='middle'
              style={{
                height: '45px',
                width: '100%'
              }}
            >
              <Button type='primary' href='/groups'>
                {t('More Groups')}
              </Button>
            </Row>
          </Row>
          <Divider />
          <Row
            style={{
              width: '100%',
              marginBottom: '20px'
            }}
          >
            <Row
              style={{
                height: '50px',
                width: '100%',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '5px'
                }}
              >
                <CardFilter
                  value={layerMode}
                  onChange={(value) => {
                    setLayerMode(value)
                  }}
                  showPopular
                />
              </div>
              <a href='/layers'>
                <Title level={2}>{t('Layers')}</Title>
              </a>
            </Row>
            <Row
              style={{
                width: '100%',
                marginBottom: '20px'
              }}
            >
              <CardCarousel cards={layerCards} />
            </Row>
            <Row
              justify='center'
              align='middle'
              style={{
                height: '45px',
                width: '100%'
              }}
            >
              <Button type='primary' href='/layers'>
                {t('More Layers')}
              </Button>
            </Row>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default Explore
