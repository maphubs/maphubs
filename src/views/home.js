// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Col, Divider, Button, Typography, Card } from 'antd'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import StorySummary from '../components/Story/StorySummary'
import Slides from '../components/Home/Slides'
import OnboardingLinks from '../components/Home/OnboardingLinks'
import MapHubsProLinks from '../components/Home/MapHubsProLinks'
import InteractiveMap from '../components/Map/InteractiveMap'
import _shuffle from 'lodash.shuffle'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import { Provider } from 'unstated'
import BaseMapContainer from '../components/Map/containers/BaseMapContainer'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {Layer} from '../types/layer'
import type {Group} from '../stores/GroupStore'
import ErrorBoundary from '../components/ErrorBoundary'
import XComponentReact from '../components/XComponentReact'
import UserStore from '../stores/UserStore'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { Title } = Typography

// import Perf from 'react-addons-perf';

type Props = {
    featuredLayers: Array<Layer>,
    featuredGroups: Array<Group>,
    featuredMaps: Array<Object>,
    featuredStories: Array<Object>,
    popularLayers: Array<Layer>,
    popularGroups: Array<Group>,
    popularMaps: Array<Object>,
    popularStories: Array<Object>,
    recentLayers: Array<Layer>,
    recentGroups: Array<Group>,
    recentMaps: Array<Object>,
    recentStories: Array<Object>,
    locale: string,
    _csrf: string,
    map: Object,
    pageConfig: Object,
    layers: Array<Layer>,
    footerConfig: Object,
    headerConfig: Object,
    mapConfig: Object,
    user: Object
  }

  type State = {
    loaded: boolean
  } & LocaleStoreState

export default class HomePro extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
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

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }

    const baseMapContainerInit: {
      baseMap?: string,
      bingKey: string,
      tileHostingKey: string,
      mapboxAccessToken: string,
      baseMapOptions?: Object
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

  componentDidMount () {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({loaded: true})
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

  handleSearch = (input: string) => {
    window.location = '/search?q=' + input
  }

  renderHomePageMap = (config: Object, key: string) => {
    let homepageMap = ''
    const style = config.style || {}
    if (this.props.map) {
      homepageMap = (
        <Row key={key} style={style}>
          <InteractiveMap
            height='calc(100vh - 150px)'
            {...this.props.map}
            mapConfig={this.props.mapConfig}
            layers={this.props.layers} showTitle={false}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
            earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
            {...this.props.map.settings}
            t={this.t}
          />
          <div className='divider' />
        </Row>
      )
    }
    return homepageMap
  }

  /* eslint-disable react/display-name */
  renderXComponent = (config: Object, key: string) => {
    if (this.state.loaded) {
      let height = '100%'
      if (config.height) {
        height = config.height
      }
      const dimensions = {width: '100%', height}
      let style = config.style || {}
      style = Object.assign(style, dimensions)
      return (
        <Row key={key} style={style}>
          <XComponentReact
            tag={config.tag}
            url={config.url}
            containerProps={{
              style: dimensions
            }}
            dimensions={dimensions}
            onComplete={() => { window.location = config.onCompleteUrl || '/' }}
          />
        </Row>
      )
    } else {
      return ''
    }
  }

  renderSlides = (config: Object, key: string) => {
    const style = config.style || {}
    return (
      <Row key={key} style={{...style}}>
        <Slides config={config} t={this.t} />
      </Row>
    )
  }

  renderOnboardingLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const style = config.style || {}
    const links = (
      <Row key={key} style={{backgroundColor: bgColor, ...style}}>
        <OnboardingLinks t={this.t} />
      </Row>
    )
    return links
  }

  renderProLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const style = config.style || {}
    const links = (
      <Row key={key} style={{backgroundColor: bgColor, ...style}}>
        <MapHubsProLinks t={this.t} />
      </Row>
    )
    return links
  }

  renderCarousel = (config: Object, key: string) => {
    const {t} = this
    const {props} = this
    let collectionCards = []
    let shuffle
    if (config.shuffle) {
      shuffle = _shuffle
    } else {
      shuffle = (data) => data
    }
    const featuredLayersCards = props.featuredLayers ? shuffle(props.featuredLayers.map(cardUtil.getLayerCard)) : []
    const featuredGroupsCards = props.featuredGroups ? shuffle(props.featuredGroups.map(cardUtil.getGroupCard)) : []
    const featuredMapsCards = props.featuredMaps ? shuffle(props.featuredMaps.map(cardUtil.getMapCard)) : []
    const featuredStoriesCards = props.featuredStories ? shuffle(props.featuredStories.map(s => cardUtil.getStoryCard(s, t))) : []
    const popularLayersCards = props.popularLayers ? shuffle(props.popularLayers.map(cardUtil.getLayerCard)) : []
    const popularGroupsCards = props.popularGroups ? shuffle(props.popularGroups.map(cardUtil.getGroupCard)) : []
    const popularMapsCards = props.popularMaps ? shuffle(props.popularMaps.map(cardUtil.getMapCard)) : []
    const popularStoriesCards = props.popularStories ? shuffle(props.popularStories.map(s => cardUtil.getStoryCard(s, t))) : []
    const recentLayersCards = props.recentLayers ? shuffle(props.recentLayers.map(cardUtil.getLayerCard)) : []
    const recentGroupsCards = props.recentGroups ? shuffle(props.recentGroups.map(cardUtil.getGroupCard)) : []
    const recentMapsCards = props.recentMaps ? shuffle(props.recentMaps.map(cardUtil.getMapCard)) : []
    const recentStoriesCards = props.recentStories ? shuffle(props.recentStories.map(s => cardUtil.getStoryCard(s, t))) : []
    if (config.datasets) {
      const cards = config.datasets.map((dataset) => {
        const {type, filter} = dataset
        if (type === 'layer') {
          if (filter === 'featured') return featuredLayersCards
          if (filter === 'popular') return popularLayersCards
          if (filter === 'recent') return recentLayersCards
        } else if (type === 'group') {
          if (filter === 'featured') return featuredGroupsCards
          if (filter === 'popular') return popularGroupsCards
          if (filter === 'recent') return recentGroupsCards
        } else if (type === 'map') {
          if (filter === 'featured') return featuredMapsCards
          if (filter === 'popular') return popularMapsCards
          if (filter === 'recent') return recentMapsCards
        } else if (type === 'story') {
          if (filter === 'featured') return featuredStoriesCards
          if (filter === 'popular') return popularStoriesCards
          if (filter === 'recent') return recentStoriesCards
        }
      })
      if (cards && cards.length > 0) {
        collectionCards = cardUtil.combineCards(cards)
      }
    } else { // combine all the results
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
      <Row key={key} style={{marginBottom: '50px', backgroundColor: bgColor, ...style}}>
        <Row style={{height: '50px', width: '100%', textAlign: 'center'}}>
          <Title level={3} style={{lineHeight: '50px', width: '100%'}}>
            {title}
            {config.trendingIcon &&
              <TrendingUpIcon style={{fontWeight: 'bold', color: MAPHUBS_CONFIG.primaryColor, fontSize: '40px', verticalAlign: '-25%', marginLeft: '5px'}} />}
          </Title>
        </Row>
        <ErrorBoundary>
          <Row>
            <CardCarousel cards={collectionCards} infinite={false} t={this.t} emptyMessage={config.emptyMessage} />
          </Row>
        </ErrorBoundary>
      </Row>
    )
    return carousel
  }

  renderStories = (config: Object, key: string) => {
    const {t} = this
    let stories = []
    const {popularStories, featuredStories, recentStories} = this.props
    if (popularStories && popularStories.length > 0) {
      stories = stories.concat(popularStories)
    }
    if (featuredStories && featuredStories.length > 0) {
      stories = stories.concat(featuredStories)
    }
    if (recentStories && recentStories.length > 0) {
      stories = stories.concat(recentStories)
    }
    let title = ''
    if (config.title) {
      title = t(config.title)
    } else {
      title = t('Stories')
    }
    const style = Object.assign(config.style || {}, { width: '100%' })
    if (stories.length > 0) {
      return (
        <Row key={key} style={style}>
          <Divider />
          <Row justify='center' style={{marginBottom: '20px', width: '100%'}}>
            <Col sm={24} med={12} style={{margin: '20px'}}>
              <Row justify='center' style={{textAlign: 'center'}}>
                <Title level={3}>{title}</Title>
              </Row>
              {stories.map(story => {
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

  renderText = (config: Object, key: string) => {
    const style = config.style || {}
    let text = config.text[this.state.locale]
    if (!text) text = config.text.en
    const textPanel = (
      <Row key={key} style={style}>
        <div className='flow-text center align-center'>
          {text}
        </div>
      </Row>
    )

    return textPanel
  }

  renderHtml = (config: Object, key: string) => {
    const style = config.style || {}
    let html = config.html[this.state.locale]
    if (!html) html = config.html.en
    const textPanel = (
      <Row key={key} style={{height: config.height || '100px', ...style}}>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </Row>
    )

    return textPanel
  }

  renderButton = (config: Object, key: string) => {
    const style = config.style || {}
    let label = config.label[this.state.locale]
    if (!label) label = config.label.en
    const button = (
      <Row
        key={key} align='middle' justify='center'
        style={{padding: '25px', textAlign: 'center', ...style}}
      >
        <Button
          type='primary'
          size='large'
          style={{margin: 'auto'}}
          href={config.href}
        >
          {label}
        </Button>
      </Row>
    )

    return button
  }

  render () {
    const _this = this
    const { t } = this
    const { pageConfig } = this.props
    if (!pageConfig || !pageConfig.components) {
      return (
        <p>Invalid page config: {JSON.stringify(pageConfig)}</p>
      )
    }

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <div style={{margin: 0, height: '100%'}}>
            <Header {...this.props.headerConfig} />
            <main style={{margin: 0}}>

              {this.props.pageConfig.components.map((component, i) => {
                const key = `homepro-component-${component.id || i}`
                const style = component.style || {}
                if (!component.disabled) {
                  if (component.type === 'map') {
                    return _this.renderHomePageMap(component, key)
                  } else if (component.type === 'carousel') {
                    return _this.renderCarousel(component, key)
                  } else if (component.type === 'storyfeed') {
                    return _this.renderStories(component, key)
                  } else if (component.type === 'text') {
                    return _this.renderText(component, key)
                  } else if (component.type === 'html') {
                    return _this.renderHtml(component, key)
                  } else if (component.type === 'links' || component.type === 'onboarding-links') {
                    return _this.renderOnboardingLinks(component, key)
                  } else if (component.type === 'pro-links') {
                    return _this.renderProLinks(component, key)
                  } else if (component.type === 'slides') {
                    return (
                      <Row key={key} style={{...style}}>
                        <Slides config={component} t={this.t} />
                      </Row>
                    )
                  } else if (component.type === 'xcomponent') {
                    return _this.renderXComponent(component, key)
                  } else if (component.type === 'button') {
                    return _this.renderButton(component, key)
                  } else {
                    return ''
                  }
                }
              })}
              {!this.props.pageConfig.disableFooter &&
                <Footer t={t} {...this.props.footerConfig} />}

            </main>
          </div>
        </Provider>
      </ErrorBoundary>
    )
  }
}
