// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import StorySummary from '../components/Story/StorySummary'
import Carousel from 'nuka-carousel'
import SliderDecorators from '../components/Home/SliderDecorators'
import PublicOnboardingLinks from '../components/Home/PublicOnboardingLinks'
import OnboardingLinks from '../components/Home/OnboardingLinks'
import MapHubsProLinks from '../components/Home/MapHubsProLinks'
import InteractiveMap from '../components/Map/InteractiveMap'
import MailingList from '../components/Home/MailingList'
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
import type {CardConfig} from '../components/CardCarousel/Card'
import ErrorBoundary from '../components/ErrorBoundary'
import XComponentReact from '../components/XComponentReact'
import UserStore from '../stores/UserStore'

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
    featuredLayersCards: Array<CardConfig>,
    featuredGroupsCards: Array<CardConfig>,
    featuredMapsCards: Array<CardConfig>,
    featuredStoriesCards: Array<CardConfig>,
    popularLayersCards: Array<CardConfig>,
    popularGroupsCards: Array<CardConfig>,
    popularMapsCards: Array<CardConfig>,
    popularStoriesCards: Array<CardConfig>,
    recentLayersCards: Array<CardConfig>,
    recentGroupsCards: Array<CardConfig>,
    recentMapsCards: Array<CardConfig>,
    recentStoriesCards: Array<CardConfig>,
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

    let baseMapContainerInit = {}
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit = {baseMapOptions: props.mapConfig.baseMapOptions}
    }
    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)

    this.state = {
      featuredLayersCards: _shuffle(props.featuredLayers.map(cardUtil.getLayerCard)),
      featuredGroupsCards: _shuffle(props.featuredGroups.map(cardUtil.getGroupCard)),
      featuredMapsCards: _shuffle(props.featuredMaps.map(cardUtil.getMapCard)),
      featuredStoriesCards: _shuffle(props.featuredStories.map(cardUtil.getStoryCard)),
      popularLayersCards: _shuffle(props.popularLayers.map(cardUtil.getLayerCard)),
      popularGroupsCards: _shuffle(props.popularGroups.map(cardUtil.getGroupCard)),
      popularMapsCards: _shuffle(props.popularMaps.map(cardUtil.getMapCard)),
      popularStoriesCards: _shuffle(props.popularStories.map(cardUtil.getStoryCard)),
      recentLayersCards: _shuffle(props.recentLayers.map(cardUtil.getLayerCard)),
      recentGroupsCards: _shuffle(props.recentGroups.map(cardUtil.getGroupCard)),
      recentMapsCards: _shuffle(props.recentMaps.map(cardUtil.getMapCard)),
      recentStoriesCards: _shuffle(props.recentStories.map(cardUtil.getStoryCard)),
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
    if (this.props.map) {
      homepageMap = (
        <div key={key} className='row'>
          <InteractiveMap height='calc(100vh - 150px)'
            {...this.props.map}
            mapConfig={this.props.mapConfig}
            layers={this.props.layers} showTitle={false}
            primaryColor={MAPHUBS_CONFIG.primaryColor}
            logoSmall={MAPHUBS_CONFIG.logoSmall}
            logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
            logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
            {...this.props.map.settings}
            t={this.t}
          />
          <div className='divider' />
        </div>
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
      return (
        <div key={key} className='row no-margin' style={dimensions}>
          <XComponentReact
            tag={config.tag}
            url={config.url}
            containerProps={{
              style: dimensions
            }}
            dimensions={dimensions}
            onComplete={() => { window.location = config.onCompleteUrl || '/' }}
          />
        </div>
      )
    } else {
      return ''
    }
  }

  renderSlides = (config: Object, key: string) => {
    const slides = (
      <div key={key} className='row' style={{marginTop: 0, marginBottom: 0, height: '70vh', maxHeight: '600px'}}>
        <Carousel autoplay slidesToShow={1} autoplayInterval={5000} wrapAround
          renderCenterLeftControls={({ previousSlide, currentSlide, wrapAround }) => (
            <SliderDecorators.LeftArrow previousSlide={previousSlide} currentSlide={currentSlide} wrapAround={wrapAround} />
          )}
          renderCenterRightControls={({ nextSlide, currentSlide, wrapAround }) => (
            <SliderDecorators.RightArrow nextSlide={nextSlide} currentSlide={currentSlide} wrapAround={wrapAround} />
          )}
          renderBottomCenterControls={({ currentSlide }) => (<div />)}
          renderBottomRightControls={({ currentSlide, slidesToScroll, slideCount, goToSlide }) => (
            <SliderDecorators.Dots currentSlide={currentSlide} slidesToScroll={slidesToScroll} slideCount={slideCount} goToSlide={goToSlide} />
          )}
        >
          {config.slides.map((slide, i) => {
            return (
              <div key={i} className='homepage-slide responsive-img valign-wrapper'
                style={{
                  height: '100%',
                  backgroundSize: 'cover',
                  backgroundImage: 'url(' + slide.img + ')'
                }}>
                <div className='slide-text'>
                  <h2 className='no-margin'>{this.t(slide.title)}</h2>
                  <h3 className='no-margin'>{this.t(slide.text)}</h3>
                </div>
                <div className='slide-button center'>
                  <a className='btn waves-effect z-depth-3' style={{borderRadius: '25px'}} href={slide.link}>{this.t(slide.buttonText)}</a>
                </div>
              </div>
            )
          })}
        </Carousel>

      </div>
    )
    return slides
  }

  renderMailingList = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const mailingList = (
      <div key={key} className='row no-margin' style={{backgroundColor: bgColor}}>
        <MailingList text={config.text} />
      </div>
    )
    return mailingList
  }

  renderLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const links = (
      <div key={key} className='row' style={{backgroundColor: bgColor}}>
        <PublicOnboardingLinks t={this.t} {...config} />
      </div>
    )
    return links
  }

  renderOnboardingLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const links = (
      <div key={key} className='row' style={{backgroundColor: bgColor}}>
        <OnboardingLinks t={this.t} />
      </div>
    )
    return links
  }

  renderProLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const links = (
      <div key={key} className='row' style={{backgroundColor: bgColor}}>
        <MapHubsProLinks t={this.t} />
      </div>
    )
    return links
  }

  renderCarousel = (config: Object, key: string) => {
    const {t} = this
    const {state} = this
    let collectionCards = []
    if (config.datasets) {
      const cards = config.datasets.map((dataset) => {
        const {type, filter} = dataset
        if (type === 'layer' && filter === 'featured') {
          if (filter === 'featured') return state.featuredLayersCards
          if (filter === 'popular') return state.popularLayersCards
          if (filter === 'recent') return state.recentLayersCards
        } else if (type === 'group') {
          if (filter === 'featured') return state.featuredGroupsCards
          if (filter === 'popular') return state.popularGroupsCards
          if (filter === 'recent') return state.recentGroupsCards
        } else if (type === 'map') {
          if (filter === 'featured') return state.featuredMapsCards
          if (filter === 'popular') return state.popularMapsCards
          if (filter === 'recent') return state.recentMapsCards
        } else if (type === 'story') {
          if (filter === 'featured') return state.featuredStoriesCards
          if (filter === 'popular') return state.popularStoriesCards
          if (filter === 'recent') return state.recentStoriesCards
        }
      })
      collectionCards = cardUtil.combineCards(cards)
    } else { // combine all the results
      collectionCards = cardUtil.combineCards([
        state.featuredLayersCards,
        state.featuredGroupsCards,
        state.featuredMapsCards,
        state.featuredStoriesCards,
        state.popularLayersCards,
        state.popularGroupsCards,
        state.popularMapsCards,
        state.popularStoriesCards,
        state.recentLayersCards,
        state.recentGroupsCards,
        state.recentMapsCards,
        state.recentStoriesCards
      ])
    }

    const bgColor = config.bgColor ? config.bgColor : 'inherit'

    let trendingIcon = ''
    if (config.trendingIcon) {
      trendingIcon = (
        <i className='material-icons' style={{fontWeight: 'bold', color: MAPHUBS_CONFIG.primaryColor, fontSize: '40px', verticalAlign: '-25%', marginLeft: '5px'}}>trending_up</i>

      )
    }

    const title = config.title ? t(config.title) : t('Trending')

    const carousel = (
      <div key={key} className='row' style={{marginBottom: '50px', backgroundColor: bgColor}}>
        <div className='row no-margin' style={{height: '50px'}}>
          <div>
            <h5 className='no-margin center-align' style={{lineHeight: '50px'}}>
              {title}
              {trendingIcon}
            </h5>
          </div>
        </div>
        <div className='row'>
          <div className='col s12'>
            <CardCarousel cards={collectionCards} infinite={false} t={this.t} />
          </div>
        </div>
      </div>
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
    if (stories.length > 0) {
      return (
        <div key={key}>
          <div className='divider' />
          <div className='row'>
            <h5 className='no-margin center-align' style={{lineHeight: '50px', color: '#212121'}}>
              {title}
            </h5>
            {stories.map(story => {
              return (
                <div className='card' key={story.story_id} style={{maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto'}}>
                  <div className='card-content'>
                    <StorySummary story={story} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }

  renderText = (config: Object, key: string) => {
    let text = config.text[this.state.locale]
    if (!text) text = config.text.en
    const textPanel = (
      <div key={key} className='row'>
        <div className='flow-text center align-center'>
          {text}
        </div>
      </div>
    )

    return textPanel
  }

  renderHtml = (config: Object, key: string) => {
    let html = config.html[this.state.locale]
    if (!html) html = config.html.en
    const textPanel = (
      <div key={key} className='row' style={{height: config.height || '100px'}}>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </div>
    )

    return textPanel
  }

  renderButton = (config: Object, key: string) => {
    let label = config.label[this.state.locale]
    if (!label) label = config.label.en
    const button = (
      <div key={key} className='row valign-wrapper'
        style={{padding: '25px'}}>
        <a
          className='waves-effect waves-light btn valign'
          style={{margin: 'auto'}}
          href={config.href}
        >
          {label}
        </a>
      </div>
    )

    return button
  }

  render () {
    const _this = this

    return (
      <ErrorBoundary>
        <Provider inject={[this.BaseMapState]}>
          <div style={{margin: 0, height: '100%'}}>
            <Header {...this.props.headerConfig} />
            <main style={{margin: 0, height: 'calc(100% - 50px)'}}>

              {this.props.pageConfig.components.map((component, i) => {
                const key = `homepro-component-${i}`
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
                  } else if (component.type === 'links') {
                    return _this.renderLinks(component, key)
                  } else if (component.type === 'onboarding-links') {
                    return _this.renderOnboardingLinks(component, key)
                  } else if (component.type === 'pro-links') {
                    return _this.renderProLinks(component, key)
                  } else if (component.type === 'slides') {
                    return _this.renderSlides(component, key)
                  } else if (component.type === 'mailinglist') {
                    return _this.renderMailingList(component, key)
                  } else if (component.type === 'xcomponent') {
                    return _this.renderXComponent(component, key)
                  } else if (component.type === 'button') {
                    return _this.renderButton(component, key)
                  } else {
                    return ''
                  }
                }
              })
              }
              {!this.props.pageConfig.disableFooter &&
              <Footer {...this.props.footerConfig} />
              }

            </main>
          </div>
        </Provider>
      </ErrorBoundary>
    )
  }
}
