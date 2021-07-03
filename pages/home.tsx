import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
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

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../src/components/Map/containers/BaseMapContainer'
import type { LocaleStoreState } from '../src/stores/LocaleStore'
import type { Layer } from '../src/types/layer'
import type { Group } from '../src/stores/GroupStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import XComponentReact from '../src/components/XComponentReact'
import UserStore from '../src/stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography
// import Perf from 'react-addons-perf';
type Props = {
  featuredLayers: Array<Layer>
  featuredGroups: Array<Group>
  featuredMaps: Array<Record<string, any>>
  featuredStories: Array<Record<string, any>>
  popularLayers: Array<Layer>
  popularGroups: Array<Group>
  popularMaps: Array<Record<string, any>>
  popularStories: Array<Record<string, any>>
  recentLayers: Array<Layer>
  recentGroups: Array<Group>
  recentMaps: Array<Record<string, any>>
  recentStories: Array<Record<string, any>>
  locale: string
  _csrf: string
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
} & LocaleStoreState
export default class HomePro extends React.Component<Props, State> {
  BaseMapState: Container<any>
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

  static defaultProps:
    | any
    | {
        featuredGroups: Array<any>
        featuredLayers: Array<any>
        featuredMaps: Array<any>
        featuredStories: Array<any>
        popularGroups: Array<any>
        popularLayers: Array<any>
        popularMaps: Array<any>
        popularStories: Array<any>
        recentGroups: Array<any>
        recentLayers: Array<any>
        recentMaps: Array<any>
        recentStories: Array<any>
      } = {
    featuredLayers: [],
    featuredGroups: [],
    featuredMaps: [],
    featuredStories: [],
    popularLayers: [],
    popularGroups: [],
    popularMaps: [],
    popularStories: [],
    recentLayers: [],
    recentGroups: [],
    recentMaps: [],
    recentStories: []
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

    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    this.state = {
      loaded: false
    }
  }

  componentDidMount(): void {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      loaded: true
    })
  }

  /*
  componentDidMount(){
    Perf.start();
  }
   componentDidUpdate(){
    Perf.stop();
    Perf.printInclusive();
    Perf.printWasted();
  }
  */
  handleSearch = (input: string): void => {
    window.location = '/search?q=' + input
  }
  renderHomePageMap = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    const { t, props } = this
    const { map, layers, mapConfig } = props
    let homepageMap = <></>
    const style = config.style || {}

    if (map) {
      homepageMap = (
        <Row key={key} style={style}>
          <InteractiveMap
            height='calc(100vh - 150px)'
            {...map}
            mapConfig={mapConfig}
            layers={layers}
            showTitle={false}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
            earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
            {...map.settings}
            t={t}
          />
          <div className='divider' />
        </Row>
      )
    }

    return homepageMap
  }

  /* eslint-disable react/display-name */
  renderXComponent = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    if (this.state.loaded) {
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
              window.location = config.onCompleteUrl || '/'
            }}
          />
        </Row>
      )
    } else {
      return <></>
    }
  }
  renderSlides = (config: Record<string, any>, key: string): JSX.Element => {
    const style = config.style || {}
    return (
      <Row key={key} style={{ ...style }}>
        <Slides config={config} t={this.t} />
      </Row>
    )
  }
  renderOnboardingLinks = (
    config: Record<string, any>,
    key: string
  ): JSX.Element => {
    const { t } = this
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const style = config.style || {}
    const links = (
      <Row
        key={key}
        style={{
          backgroundColor: bgColor,
          ...style
        }}
      >
        <OnboardingLinks t={t} />
      </Row>
    )
    return links
  }
  renderProLinks = (config: Record<string, any>, key: string): JSX.Element => {
    const { t } = this
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const style = config.style || {}
    const links = (
      <Row
        key={key}
        style={{
          backgroundColor: bgColor,
          ...style
        }}
      >
        <MapHubsProLinks t={t} />
      </Row>
    )
    return links
  }
  renderCarousel = (config: Record<string, any>, key: string): JSX.Element => {
    const { t } = this
    const { props } = this
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
    const popularGroupsCards = props.popularGroups
      ? shuffle(
          props.popularGroups.map((element) => cardUtil.getGroupCard(element))
        )
      : []
    const popularMapsCards = props.popularMaps
      ? shuffle(
          props.popularMaps.map((element) => cardUtil.getMapCard(element))
        )
      : []
    const popularStoriesCards = props.popularStories
      ? shuffle(props.popularStories.map((s) => cardUtil.getStoryCard(s, t)))
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
            if (filter === 'popular') return popularGroupsCards
            if (filter === 'recent') return recentGroupsCards

            break
          }
          case 'map': {
            if (filter === 'featured') return featuredMapsCards
            if (filter === 'popular') return popularMapsCards
            if (filter === 'recent') return recentMapsCards

            break
          }
          case 'story': {
            if (filter === 'featured') return featuredStoriesCards
            if (filter === 'popular') return popularStoriesCards
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
        popularGroupsCards,
        popularMapsCards,
        popularStoriesCards,
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
        <ErrorBoundary>
          <Row>
            <CardCarousel
              cards={collectionCards}
              infinite={false}
              t={t}
              emptyMessage={config.emptyMessage}
            />
          </Row>
        </ErrorBoundary>
      </Row>
    )
    return carousel
  }
  renderStories = (config: Record<string, any>, key: string): JSX.Element => {
    const { t, props } = this
    let stories = []
    const { popularStories, featuredStories, recentStories } = props

    if (popularStories && popularStories.length > 0) {
      stories = [...stories, ...popularStories]
    }

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
  renderText = (config: Record<string, any>, key: string): JSX.Element => {
    const style = config.style || {}
    let text = config.text[this.state.locale]
    if (!text) text = config.text.en
    const textPanel = (
      <Row key={key} style={style}>
        <div className='flow-text center align-center'>{text}</div>
      </Row>
    )
    return textPanel
  }
  renderHtml = (config: Record<string, any>, key: string): JSX.Element => {
    const style = config.style || {}
    let html = config.html[this.state.locale]
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
  renderButton = (config: Record<string, any>, key: string): JSX.Element => {
    const style = config.style || {}
    let label = config.label[this.state.locale]
    if (!label) label = config.label.en
    const button = (
      <Row
        key={key}
        align='middle'
        justify='center'
        style={{
          padding: '25px',
          textAlign: 'center',
          ...style
        }}
      >
        <Button
          type='primary'
          size='large'
          style={{
            margin: 'auto'
          }}
          href={config.href}
        >
          {label}
        </Button>
      </Row>
    )
    return button
  }

  render(): JSX.Element {
    const {
      t,
      props,
      BaseMapState,
      renderHomePageMap,
      renderCarousel,
      renderStories,
      renderText,
      renderHtml,
      renderOnboardingLinks,
      renderProLinks,
      renderXComponent,
      renderButton
    } = this
    const { pageConfig, headerConfig, footerConfig } = props

    if (!pageConfig || !pageConfig.components) {
      return <p>Invalid page config: {JSON.stringify(pageConfig)}</p>
    }

    return (
      <ErrorBoundary>
        <Provider inject={[BaseMapState]}>
          <div
            style={{
              margin: 0,
              height: '100%'
            }}
          >
            <Header {...headerConfig} />
            <main
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
                      return renderHomePageMap(component, key)
                    }
                    case 'carousel': {
                      return renderCarousel(component, key)
                    }
                    case 'storyfeed': {
                      return renderStories(component, key)
                    }
                    case 'text': {
                      return renderText(component, key)
                    }
                    case 'html': {
                      return renderHtml(component, key)
                    }
                    case 'links':
                    case 'onboarding-links': {
                      return renderOnboardingLinks(component, key)
                    }
                    case 'pro-links': {
                      return renderProLinks(component, key)
                    }
                    case 'slides': {
                      return (
                        <Row key={key} style={{ ...style }}>
                          <Slides config={component} t={t} />
                        </Row>
                      )
                    }
                    case 'xcomponent': {
                      return renderXComponent(component, key)
                    }
                    case 'button': {
                      return renderButton(component, key)
                    }
                    default: {
                      return ''
                    }
                  }
                }
              })}
              {!pageConfig.disableFooter && <Footer t={t} {...footerConfig} />}
            </main>
          </div>
        </Provider>
      </ErrorBoundary>
    )
  }
}
