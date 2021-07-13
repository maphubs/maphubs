import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import SearchBox from '../src/components/SearchBox'
import CardCarousel from '../src/components/CardCarousel/CardCarousel'
import _shuffle from 'lodash.shuffle'
import CardFilter from '../src/components/Home/CardFilter'
import cardUtil from '../src/services/card-util'
import ErrorBoundary from '../src/components/ErrorBoundary'
import getConfig from 'next/config'
import { Row, Col, Button, Divider, Typography } from 'antd'
import { Layer } from '../src/types/layer'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography

type Props = {
  featuredLayers: Layer[]
  featuredGroups: Array<Record<string, any>>
  featuredMaps: Array<Record<string, any>>
  featuredStories: Array<Record<string, any>>
  popularLayers: Layer[]
  popularGroups: Array<Record<string, any>>
  popularMaps: Array<Record<string, any>>
  popularStories: Array<Record<string, any>>
  recentLayers: Layer[]
  recentGroups: Array<Record<string, any>>
  recentMaps: Array<Record<string, any>>
  recentStories: Array<Record<string, any>>
  locale: string
  _csrf: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  storyMode: string
  mapMode: string
  groupMode: string
  layerMode: string
}
export default class Home extends React.Component<Props, State> {
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

    this.state = {
      storyMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      mapMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      groupMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      layerMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured'
    }
  }

  handleSearch = (input: string): void => {
    window.location.assign('/search?q=' + input)
  }

  render(): JSX.Element {
    const { t, props, state, handleSearch, setState } = this

    const {
      headerConfig,
      featuredStories,
      popularStories,
      recentMaps,
      featuredMaps,
      popularMaps,
      featuredGroups,
      popularGroups,
      recentGroups,
      featuredLayers,
      popularLayers,
      recentLayers,
      footerConfig
    } = props
    const { storyMode, mapMode, groupMode, layerMode } = state
    let storyCards = []

    switch (storyMode) {
      case 'featured': {
        storyCards = _shuffle(
          featuredStories.map((s) => cardUtil.getStoryCard(s, t))
        )

        break
      }
      case 'popular': {
        storyCards = _shuffle(
          popularStories.map((s) => cardUtil.getStoryCard(s, t))
        )

        break
      }
      case 'recent': {
        storyCards = _shuffle(
          recentMaps.map((element) => cardUtil.getMapCard(element))
        )

        break
      }
      // No default
    }

    let mapCards = []

    switch (mapMode) {
      case 'featured': {
        mapCards = _shuffle(
          featuredMaps.map((element) => cardUtil.getMapCard(element))
        )

        break
      }
      case 'popular': {
        mapCards = _shuffle(
          popularMaps.map((element) => cardUtil.getMapCard(element))
        )

        break
      }
      case 'recent': {
        mapCards = _shuffle(
          recentMaps.map((element) => cardUtil.getMapCard(element))
        )

        break
      }
      // No default
    }

    let groupCards = []

    switch (groupMode) {
      case 'featured': {
        groupCards = _shuffle(
          featuredGroups.map((element) => cardUtil.getGroupCard(element))
        )

        break
      }
      case 'popular': {
        groupCards = _shuffle(
          popularGroups.map((element) => cardUtil.getGroupCard(element))
        )

        break
      }
      case 'recent': {
        groupCards = _shuffle(
          recentGroups.map((element) => cardUtil.getGroupCard(element))
        )

        break
      }
      // No default
    }

    let layerCards = []

    switch (layerMode) {
      case 'featured': {
        layerCards = _shuffle(
          featuredLayers.map((element) => cardUtil.getLayerCard(element))
        )

        break
      }
      case 'popular': {
        layerCards = _shuffle(
          popularLayers.map((element) => cardUtil.getLayerCard(element))
        )

        break
      }
      case 'recent': {
        layerCards = _shuffle(
          recentLayers.map((element) => cardUtil.getLayerCard(element))
        )

        break
      }
      // No default
    }

    return (
      <ErrorBoundary t={t}>
        <Header activePage='explore' {...headerConfig} />
        <main
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
                label={t('Search') + ' ' + MAPHUBS_CONFIG.productName}
                onSearch={handleSearch}
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
                    setState({
                      storyMode: value
                    })
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
              <CardCarousel cards={storyCards} t={t} />
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
                    setState({
                      mapMode: value
                    })
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
              <CardCarousel cards={mapCards} t={t} />
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
                    setState({
                      groupMode: value
                    })
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
              <CardCarousel cards={groupCards} t={t} />
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
                    setState({
                      layerMode: value
                    })
                  }}
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
              <CardCarousel cards={layerCards} t={t} />
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
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
