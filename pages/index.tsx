import React, { useState, useEffect } from 'react'
import Layout from '../src/components/Layout'
import { Row, Col, Divider, Button, Typography, Card } from 'antd'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import CardCarousel from '../src/components/CardCarousel/CardCarousel'
import StorySummary from '../src/components/Story/StorySummary'
import Slides from '../src/components/Home/Slides'
import OnboardingLinks from '../src/components/Home/OnboardingLinks'
import MapHubsProLinks from '../src/components/Home/MapHubsProLinks'
import InteractiveMap from '../src/components/Map/InteractiveMap'
import _shuffle from 'lodash.shuffle'
import cardUtil from '../src/services/card-util'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'

import type { Layer } from '../src/types/layer'
import type { Group } from '../src/stores/GroupStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import XComponentReact from '../src/components/XComponentReact'
import getConfig from 'next/config'
import { Story } from '../src/types/story'
import useT from '../src/hooks/useT'
import HomePageMap from '../src/components/Home/HomePageMap'
import HomePageButton from '../src/components/Home/HomePageButton'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography

type Props = {
  featuredLayers: Array<Layer>
  featuredGroups: Array<Group>
  featuredMaps: Array<Record<string, any>>
  featuredStories: Array<Record<string, any>>
  popularLayers: Array<Layer>
  recentLayers: Array<Layer>
  recentGroups: Array<Group>
  recentMaps: Array<Record<string, any>>
  recentStories: Array<Record<string, any>>
  locale: string
  map: Record<string, any>
  pageConfig: Record<string, any>
  layers: Array<Layer>
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  loaded: boolean
}

const Home = (): JSX.Element => {
  const { t } = useT()
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    setLoaded(true)
  }, [])

  /* eslint-disable react/display-name */
  const renderXComponent = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    if (loaded) {
      const dimensions = {
        width: '100%',
        height: config.height || '100%'
      }
      return (
        <Row key={key} style={config.style}>
          <XComponentReact
            tag={config.tag}
            url={config.url}
            containerProps={{
              style: dimensions
            }}
            dimensions={dimensions}
            onComplete={() => {
              window.location.assign(config.onCompleteUrl || '/')
            }}
          />
        </Row>
      )
    } else {
      return <></>
    }
  }

  const renderCarousel = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    let collectionCards = []

    const shuffle = config.shuffle ? _shuffle : (data) => data

    const featuredLayersCards = props.featuredLayers
      ? shuffle(
          props.featuredLayers.map((element) => cardUtil.getLayerCard(element))
        )
      : []
    const featuredGroupsCards = props.featuredGroups
      ? shuffle(
          props.featuredGroups.map((element) => cardUtil.getGroupCard(element))
        )
      : []
    const featuredMapsCards = props.featuredMaps
      ? shuffle(
          props.featuredMaps.map((element) => cardUtil.getMapCard(element))
        )
      : []
    const featuredStoriesCards = props.featuredStories
      ? shuffle(props.featuredStories.map((s) => cardUtil.getStoryCard(s, t)))
      : []
    const popularLayersCards = props.popularLayers
      ? shuffle(
          props.popularLayers.map((element) => cardUtil.getLayerCard(element))
        )
      : []

    const recentLayersCards = props.recentLayers
      ? shuffle(
          props.recentLayers.map((element) => cardUtil.getLayerCard(element))
        )
      : []
    const recentGroupsCards = props.recentGroups
      ? shuffle(
          props.recentGroups.map((element) => cardUtil.getGroupCard(element))
        )
      : []
    const recentMapsCards = props.recentMaps
      ? shuffle(props.recentMaps.map((element) => cardUtil.getMapCard(element)))
      : []
    const recentStoriesCards = props.recentStories
      ? shuffle(props.recentStories.map((s) => cardUtil.getStoryCard(s, t)))
      : []

    if (config.datasets) {
      const cards = config.datasets.map((dataset) => {
        const { type, filter } = dataset

        switch (type) {
          case 'layer': {
            if (filter === 'featured') return featuredLayersCards
            if (filter === 'popular') return popularLayersCards
            if (filter === 'recent') return recentLayersCards

            break
          }
          case 'group': {
            if (filter === 'featured') return featuredGroupsCards
            if (filter === 'recent') return recentGroupsCards

            break
          }
          case 'map': {
            if (filter === 'featured') return featuredMapsCards
            if (filter === 'recent') return recentMapsCards

            break
          }
          case 'story': {
            if (filter === 'featured') return featuredStoriesCards
            if (filter === 'recent') return recentStoriesCards

            break
          }
          // No default
        }
      })

      if (cards && cards.length > 0) {
        collectionCards = cardUtil.combineCards(cards)
      }
    } else {
      // combine all the results
      collectionCards = cardUtil.combineCards([
        featuredLayersCards,
        featuredGroupsCards,
        featuredMapsCards,
        featuredStoriesCards,
        popularLayersCards,
        recentLayersCards,
        recentGroupsCards,
        recentMapsCards,
        recentStoriesCards
      ])
    }

    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const style = config.style || {}
    const title = config.title ? t(config.title) : t('Trending')
    const carousel = (
      <Row
        key={key}
        style={{
          marginBottom: '50px',
          backgroundColor: bgColor,
          ...style
        }}
      >
        <Row
          style={{
            height: '50px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Title
            level={3}
            style={{
              lineHeight: '50px',
              width: '100%'
            }}
          >
            {title}
            {config.trendingIcon && (
              <TrendingUpIcon
                style={{
                  fontWeight: 'bold',
                  color: MAPHUBS_CONFIG.primaryColor,
                  fontSize: '40px',
                  verticalAlign: '-25%',
                  marginLeft: '5px'
                }}
              />
            )}
          </Title>
        </Row>
        <ErrorBoundary t={t}>
          <Row>
            <CardCarousel
              cards={collectionCards}
              emptyMessage={config.emptyMessage}
            />
          </Row>
        </ErrorBoundary>
      </Row>
    )
    return carousel
  }
  const renderStories = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    let stories = []
    const { featuredStories, recentStories } = props

    if (featuredStories && featuredStories.length > 0) {
      stories = [...stories, ...featuredStories]
    }

    if (recentStories && recentStories.length > 0) {
      stories = [...stories, ...recentStories]
    }

    const title = config.title ? t(config.title) : t('Stories')

    const style = Object.assign(config.style || {}, {
      width: '100%'
    })

    if (stories.length > 0) {
      return (
        <Row key={key} style={style}>
          <Divider />
          <Row
            justify='center'
            style={{
              marginBottom: '20px',
              width: '100%'
            }}
          >
            <Col
              sm={24}
              md={12}
              style={{
                margin: '20px'
              }}
            >
              <Row
                justify='center'
                style={{
                  textAlign: 'center'
                }}
              >
                <Title level={3}>{title}</Title>
              </Row>
              {stories.map((story) => {
                return (
                  <Card
                    key={story.story_id}
                    style={{
                      maxWidth: '800px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginBottom: '20px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <StorySummary story={story} t={t} />
                  </Card>
                )
              })}
            </Col>
          </Row>
        </Row>
      )
    }
  }

  const renderHtml = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    const style = config.style || {}
    let html = t(config.html)
    if (!html) html = config.html.en
    const textPanel = (
      <Row
        key={key}
        style={{
          height: config.height || '100px',
          ...style
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: html
          }}
        />
      </Row>
    )
    return textPanel
  }

  if (!pageConfig || !pageConfig.components) {
    return <p>Invalid page config: {JSON.stringify(pageConfig)}</p>
  }

  return (
    <ErrorBoundary t={t}>
      <div
        style={{
          margin: 0,
          height: '100%'
        }}
      >
        <Layout
          title={t(pageConfig.title || 'Home')}
          hideFooter={pageConfig.disableFooter}
        >
          <div
            style={{
              margin: 0
            }}
          >
            {pageConfig.components.map((component, i) => {
              const key = `homepro-component-${component.id || i}`
              const style = component.style || {}

              if (!component.disabled) {
                switch (component.type) {
                  case 'map': {
                    return (
                      <HomePageMap
                        key={key}
                        map_id={component.map_id}
                        style={component.style}
                      />
                    )
                  }
                  case 'carousel': {
                    return renderCarousel(component, key)
                  }
                  case 'storyfeed': {
                    return renderStories(component, key)
                  }
                  case 'text': {
                    return (
                      <Row key={key} style={component.style || {}}>
                        <div className='flow-text center align-center'>
                          {t(component.text)}
                        </div>
                      </Row>
                    )
                  }
                  case 'html': {
                    return renderHtml(component, key)
                  }
                  case 'links':
                  case 'onboarding-links': {
                    const style = component.style || {}
                    return (
                      <Row
                        key={key}
                        style={{
                          backgroundColor: component.bgColor || 'inherit',
                          ...style
                        }}
                      >
                        <OnboardingLinks />
                      </Row>
                    )
                  }
                  case 'pro-links': {
                    const style = component.style || {}
                    return (
                      <Row
                        key={key}
                        style={{
                          backgroundColor: component.bgColor || 'inherit',
                          ...style
                        }}
                      >
                        <MapHubsProLinks />
                      </Row>
                    )
                  }
                  case 'slides': {
                    return (
                      <Row key={key} style={{ ...style }}>
                        <Slides config={component} />
                      </Row>
                    )
                  }
                  case 'xcomponent': {
                    return renderXComponent(component, key)
                  }
                  case 'button': {
                    return (
                      <HomePageButton
                        key={key}
                        label={component.label}
                        href={component.href}
                        style={component.style || {}}
                      />
                    )
                  }
                  default: {
                    return ''
                  }
                }
              }
            })}
          </div>
        </Layout>
      </div>
    </ErrorBoundary>
  )
}
export default Home
