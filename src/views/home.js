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
import InteractiveMap from '../components/InteractiveMap'
import MailingList from '../components/Home/MailingList'
import _shuffle from 'lodash.shuffle'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import BaseMapStore from '../stores/map/BaseMapStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {Layer} from '../stores/layer-store'
import type {Group} from '../stores/GroupStore'
import type {CardConfig} from '../components/CardCarousel/Card'
import ErrorBoundary from '../components/ErrorBoundary'
import XComponentReact from '../components/XComponentReact'

// import Perf from 'react-addons-perf';

type Props = {
    trendingLayers: Array<Layer>,
    trendingGroups:Array<Group>,
    trendingHubs: Array<Object>,
    trendingMaps: Array<Object>,
    trendingStories: Array<Object>,
    featuredStories: Array<Object>,
    locale: string,
    _csrf: string,
    map: Object,
    pageConfig: Object,
    layers: Array<Layer>,
    footerConfig: Object,
    headerConfig: Object,
    mapConfig: Object
  }

  type State = {
    collectionStoryCards: Array<CardConfig>,
    collectionMapCards: Array<CardConfig>,
    collectionHubCards: Array<CardConfig>,
    collectionGroupCards: Array<CardConfig>,
    collectionLayerCards: Array<CardConfig>,
    loaded: boolean
  } & LocaleStoreState

export default class HomePro extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    trendingStories: [],
    trendingMaps: [],
    trendingHubs: [],
    trendingGroups: [],
    trendingLayers: []
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(BaseMapStore)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions})
    }
    this.state = {
      collectionStoryCards: _shuffle(this.props.trendingStories.map(cardUtil.getStoryCard)),
      collectionMapCards: _shuffle(this.props.trendingMaps.map(cardUtil.getMapCard)),
      collectionHubCards: _shuffle(this.props.trendingHubs.map(cardUtil.getHubCard)),
      collectionGroupCards: _shuffle(this.props.trendingGroups.map(cardUtil.getGroupCard)),
      collectionLayerCards: _shuffle(this.props.trendingLayers.map(cardUtil.getLayerCard)),
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
            {...this.props.map.settings}
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
      <div key={key} className='row' style={{marginTop: 0, marginBottom: 0, height: '70%', maxHeight: '600px'}}>
        <Carousel autoplay slidesToShow={1} autoplayInterval={5000} wrapAround
          decorators={SliderDecorators}>
          {config.slides.map((slide, i) => {
            return (
              <div key={i} className='homepage-slide responsive-img valign-wrapper'
                style={{
                  height: '100%',
                  backgroundSize: 'cover',
                  backgroundImage: 'url(' + slide.img + ')'
                }}>
                <div className='slide-text'>
                  <h2 className='no-margin'>{this._o_(slide.title)}</h2>
                  <h3 className='no-margin'>{this._o_(slide.text)}</h3>
                </div>
                <div className='slide-button center'>
                  <a className='btn waves-effect z-depth-3' style={{borderRadius: '25px'}} href={slide.link}>{this._o_(slide.buttonText)}</a>
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
        <PublicOnboardingLinks {...config} />
      </div>
    )
    return links
  }

  renderOnboardingLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const links = (
      <div key={key} className='row' style={{backgroundColor: bgColor}}>
        <OnboardingLinks />
      </div>
    )
    return links
  }

  renderProLinks = (config: Object, key: string) => {
    const bgColor = config.bgColor ? config.bgColor : 'inherit'
    const links = (
      <div key={key} className='row' style={{backgroundColor: bgColor}}>
        <MapHubsProLinks />
      </div>
    )
    return links
  }

  renderCarousel = (config: Object, key: string) => {
    const collectionCards = cardUtil.combineCards([this.state.collectionLayerCards,
      this.state.collectionGroupCards,
      this.state.collectionHubCards,
      this.state.collectionMapCards,
      this.state.collectionStoryCards])

    const bgColor = config.bgColor ? config.bgColor : 'inherit'

    let trendingIcon = ''
    if (config.trendingIcon) {
      trendingIcon = (
        <i className='material-icons' style={{fontWeight: 'bold', color: MAPHUBS_CONFIG.primaryColor, fontSize: '40px', verticalAlign: '-25%', marginLeft: '5px'}}>trending_up</i>

      )
    }

    const title = config.title ? this._o_(config.title) : this.__('Trending')

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
            <CardCarousel cards={collectionCards} infinite={false} />
          </div>
        </div>
      </div>
    )
    return carousel
  }

  renderStories = (key: string) => {
    let featured = ''
    if (this.props.featuredStories && this.props.featuredStories.length > 0) {
      featured = (
        <div key={key}>
          <div className='divider' />
          <div className='row'>
            <h5 className='no-margin center-align' style={{lineHeight: '50px', color: '#212121'}}>
              {this.__('Featured Stories')}
            </h5>
            {this.props.featuredStories.map(story => {
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
    return featured
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

  renderButton = (config: Object, key: string) => {
    let label = config.label[this.state.locale]
    if (!label) label = config.text.en
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
                  return _this.renderStories(key)
                } else if (component.type === 'text') {
                  return _this.renderText(component, key)
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
      </ErrorBoundary>
    )
  }
}
