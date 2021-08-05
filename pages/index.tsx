import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../src/components/Layout/LayoutSSR'
import { getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import { Row, Col, Divider, Typography, Card } from 'antd'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import CardCarousel from '../src/components/CardCarousel/CardCarousel'
import StorySummary from '../src/components/Story/StorySummary'
import Slides from '../src/components/Home/Slides'
import OnboardingLinks from '../src/components/Home/OnboardingLinks'
import MapHubsProLinks from '../src/components/Home/MapHubsProLinks'
import _shuffle from 'lodash.shuffle'
import cardUtil from '../src/services/card-util'

import { Layer } from '../src/types/layer'
import { Group } from '../src/types/group'
import ErrorBoundary from '../src/components/ErrorBoundary'
import XComponentReact from '../src/components/XComponentReact'
import { Story } from '../src/types/story'
import useT from '../src/hooks/useT'
import HomePageMap from '../src/components/Home/HomePageMap'
import HomePageButton from '../src/components/Home/HomePageButton'
import { Map } from '../src/types/map'
import { LocalizedString } from '../src/types/LocalizedString'

// SSR only
import PageModel from '../src/models/page'
import StoryModel from '../src/models/story'
import GroupModel from '../src/models/group'
import LayerModel from '../src/models/layer'
import MapModel from '../src/models/map'
import { HeaderConfig } from '../src/components/header'
import { FooterConfig } from '../src/components/footer'

const { Title } = Typography

type Props = {
  featuredLayers?: Layer[]
  popularLayers?: Layer[]
  recentLayers?: Layer[]
  featuredStories?: Story[]
  recentStories?: Story[]
  featuredGroups?: Group[]
  recentGroups?: Group[]
  featuredMaps?: Map[]
  recentMaps?: Map[]
  pageConfig?: PageConfig
  headerConfig?: HeaderConfig
  footerConfig?: FooterConfig
}
type State = {
  loaded: boolean
}

type PageConfig = {
  components: Array<any>
  disableFooter?: boolean
  title?: string
}

// use SSR for SEO
export const getServerSideProps: GetServerSideProps = async (context) => {
  let pageConfig = { components: [] }
  let headerConfig = {}
  let footerConfig = {}
  const result = await PageModel.getPageConfigs(['home', 'header', 'footer'])
  if (result.length > 0) {
    pageConfig = result[0]
    headerConfig = result[1]
    footerConfig = result[2]
  }

  const results: Props = {}

  if (
    pageConfig &&
    pageConfig.components &&
    Array.isArray(pageConfig.components) &&
    pageConfig.components.length > 0
  ) {
    await Promise.all(
      pageConfig.components.map(async (component: Record<string, any>) => {
        switch (component.type) {
          case 'storyfeed': {
            if (component.datasets) {
              await Promise.all(
                component.datasets.map(async (dataset) => {
                  const { type, max, tags } = dataset
                  const number = max || 6

                  switch (type) {
                    case 'featured': {
                      results.featuredStories =
                        await StoryModel.getFeaturedStories(number)
                      break
                    }
                    case 'recent': {
                      results.recentStories = await StoryModel.getRecentStories(
                        {
                          number,
                          tags
                        }
                      )
                      break
                    }
                  }
                })
              )
            } else {
              results.featuredStories = await StoryModel.getFeaturedStories(5)
            }

            break
          }
          case 'carousel': {
            if (
              component.datasets &&
              Array.isArray(component.datasets) &&
              component.datasets.length > 0
            ) {
              await Promise.all(
                component.datasets.map(async (dataset) => {
                  const { type, filter, max, tags } = dataset
                  const number = max || 6

                  switch (type) {
                    case 'layer': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredLayers =
                            await LayerModel.getFeaturedLayers(number)
                          break
                        }
                        case 'popular': {
                          results.popularLayers =
                            await LayerModel.getPopularLayers(number)
                          break
                        }
                        case 'recent': {
                          results.recentLayers =
                            await LayerModel.getRecentLayers(number)
                          break
                        }
                        // No default
                      }
                      break
                    }
                    case 'group': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredGroups =
                            await GroupModel.getFeaturedGroups(number)

                          break
                        }
                        case 'recent': {
                          results.recentGroups =
                            await GroupModel.getRecentGroups(number)
                          break
                        }
                        // No default
                      }

                      break
                    }
                    case 'map': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredMaps = await MapModel.getFeaturedMaps(
                            number
                          )
                          break
                        }
                        case 'recent': {
                          results.recentMaps = await MapModel.getRecentMaps(
                            number
                          )
                          break
                        }
                      }
                      break
                    }
                    case 'story': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredStories =
                            await StoryModel.getFeaturedStories(number)

                          break
                        }
                        case 'recent': {
                          results.recentStories =
                            await StoryModel.getRecentStories({
                              number,
                              tags
                            })
                          break
                        }
                      }
                      break
                    }
                  }
                })
              )
            }
            break
          }
        }
      })
    )
  }

  return {
    props: {
      pageConfig,
      headerConfig,
      footerConfig,
      session: await getSession(context),
      ...results
    }
  }
}

const Home = ({
  pageConfig,
  featuredLayers,
  popularLayers,
  recentLayers,
  featuredStories,
  recentStories,
  featuredGroups,
  recentGroups,
  featuredMaps,
  recentMaps,
  headerConfig,
  footerConfig
}: Props): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
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
              router.push(config.onCompleteUrl || '/')
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

    const featuredLayersCards = featuredLayers
      ? shuffle(featuredLayers.map((element) => cardUtil.getLayerCard(element)))
      : []
    const featuredGroupsCards = featuredGroups
      ? shuffle(featuredGroups.map((element) => cardUtil.getGroupCard(element)))
      : []
    const featuredMapsCards = featuredMaps
      ? shuffle(featuredMaps.map((element) => cardUtil.getMapCard(element)))
      : []
    const featuredStoriesCards = featuredStories
      ? shuffle(featuredStories.map((s) => cardUtil.getStoryCard(s, t)))
      : []
    const popularLayersCards = popularLayers
      ? shuffle(popularLayers.map((element) => cardUtil.getLayerCard(element)))
      : []

    const recentLayersCards = recentLayers
      ? shuffle(recentLayers.map((element) => cardUtil.getLayerCard(element)))
      : []
    const recentGroupsCards = recentGroups
      ? shuffle(recentGroups.map((element) => cardUtil.getGroupCard(element)))
      : []
    const recentMapsCards = recentMaps
      ? shuffle(recentMaps.map((element) => cardUtil.getMapCard(element)))
      : []
    const recentStoriesCards = recentStories
      ? shuffle(recentStories.map((s) => cardUtil.getStoryCard(s, t)))
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
                  color: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
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
    config: { title?: LocalizedString; style: React.CSSProperties },
    key: string
  ): JSX.Element => {
    let stories = []

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
          headerConfig={headerConfig}
          footerConfig={footerConfig}
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
                      <Row key={key} style={style}>
                        <div className='flow-text center align-center'>
                          {t(component.text)}
                        </div>
                      </Row>
                    )
                  }
                  case 'html': {
                    return (
                      <Row
                        key={key}
                        style={{
                          height: component.height || '100px',
                          ...style
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: t(component.html)
                          }}
                        />
                      </Row>
                    )
                  }
                  case 'links':
                  case 'onboarding-links': {
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
