// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import _shuffle from 'lodash.shuffle'
import CardFilter from '../components/Home/CardFilter'
import cardUtil from '../services/card-util'
import SubPageBanner from '../components/Home/SubPageBanner'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import type {CardConfig} from '../components/CardCarousel/Card'
import UserStore from '../stores/UserStore'

type Props = {
  featuredLayers: Array<Object>,
  featuredGroups: Array<Object>,
  featuredMaps: Array<Object>,
  featuredStories: Array<Object>,
  popularLayers: Array<Object>,
  popularGroups: Array<Object>,
  popularMaps: Array<Object>,
  popularStories: Array<Object>,
  recentLayers: Array<Object>,
  recentGroups: Array<Object>,
  recentMaps: Array<Object>,
  recentStories: Array<Object>,
  locale: string,
  _csrf: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  storyMode: string,
  mapMode: string,
  groupMode: string,
  layerMode: string,
  featuredStoryCards: Array<CardConfig>,
  popularStoryCards: Array<CardConfig>,
  recentStoryCards: Array<CardConfig>,
  featuredMapCards: Array<CardConfig>,
  popularMapCards: Array<CardConfig>,
  recentMapCards: Array<CardConfig>,
  featuredGroupCards: Array<CardConfig>,
  popularGroupCards: Array<CardConfig>,
  recentGroupCards: Array<CardConfig>,
  featuredLayerCards: Array<CardConfig>,
  popularLayerCards: Array<CardConfig>,
  recentLayerCards: Array<CardConfig>
}

export default class Home extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.state = {
      storyMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      mapMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      groupMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',
      layerMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured',

      featuredStoryCards: _shuffle(props.featuredStories.map(cardUtil.getStoryCard)),
      popularStoryCards: _shuffle(props.popularStories.map(cardUtil.getStoryCard)),
      recentStoryCards: _shuffle(props.recentStories.map(cardUtil.getStoryCard)),

      featuredMapCards: _shuffle(props.featuredMaps.map(cardUtil.getMapCard)),
      popularMapCards: _shuffle(props.popularMaps.map(cardUtil.getMapCard)),
      recentMapCards: _shuffle(props.recentMaps.map(cardUtil.getMapCard)),

      featuredGroupCards: _shuffle(props.featuredGroups.map(cardUtil.getGroupCard)),
      popularGroupCards: _shuffle(props.popularGroups.map(cardUtil.getGroupCard)),
      recentGroupCards: _shuffle(props.recentGroups.map(cardUtil.getGroupCard)),

      featuredLayerCards: _shuffle(props.featuredLayers.map(cardUtil.getLayerCard)),
      popularLayerCards: _shuffle(props.popularLayers.map(cardUtil.getLayerCard)),
      recentLayerCards: _shuffle(props.recentLayers.map(cardUtil.getLayerCard))
    }
  }

  handleSearch = (input: string) => {
    window.location = '/search?q=' + input
  }

  render () {
    const {t} = this
    const _this = this
    const {storyMode, mapMode, groupMode, layerMode, featuredStoryCards, popularStoryCards, recentStoryCards} = this.state
    let storyCards = []
    if (storyMode === 'featured') {
      storyCards = featuredStoryCards
    } else if (storyMode === 'popular') {
      storyCards = popularStoryCards
    } else if (storyMode === 'recent') {
      storyCards = recentStoryCards
    }

    let mapCards = []
    if (mapMode === 'featured') {
      mapCards = this.state.featuredMapCards
    } else if (mapMode === 'popular') {
      mapCards = this.state.popularMapCards
    } else if (mapMode === 'recent') {
      mapCards = this.state.recentMapCards
    }

    let groupCards = []
    if (groupMode === 'featured') {
      groupCards = this.state.featuredGroupCards
    } else if (groupMode === 'popular') {
      groupCards = this.state.popularGroupCards
    } else if (groupMode === 'recent') {
      groupCards = this.state.recentGroupCards
    }

    let layerCards = []
    if (layerMode === 'featured') {
      layerCards = this.state.featuredLayerCards
    } else if (layerMode === 'popular') {
      layerCards = this.state.popularLayerCards
    } else if (layerMode === 'recent') {
      layerCards = this.state.recentLayerCards
    }

    return (
      <ErrorBoundary>
        <Header activePage='explore' {...this.props.headerConfig} />
        <main style={{margin: 0}}>
          <SubPageBanner locale={this.props.locale}
            img='https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/home/Moabi-Canoe.jpg' backgroundPosition='50% 15%'
            title={t('Explore')} subTitle={t(`
               Browse Stories, Maps, Groups, and Layers
              `)} />
          <div className='row' style={{marginTop: '20px', marginBottom: 0, marginRight: '5px'}}>
            <div className='col s12' style={{paddingLeft: '25%', paddingRight: '25%'}}>
              <SearchBox label={t('Search') + ' ' + MAPHUBS_CONFIG.productName} onSearch={this.handleSearch} />
            </div>
          </div>
          <div className='row no-margin'>
            <div className='row no-margin' style={{height: '50px'}}>
              <div className='col s12 m2 l1'>
                <a href='/stories'>
                  <h5 className='home-section no-margin' style={{lineHeight: '50px'}}>{t('Stories')}</h5>
                </a>
              </div>
              <div className='col s12 m6 l7 valign-wrapper' style={{height: '50px'}} />
              <div className='col s12 m4 l4 valign-wrapper' style={{height: '100%'}}>
                <CardFilter defaultValue={this.state.storyMode} onChange={(value) => { _this.setState({storyMode: value}) }} />
              </div>
            </div>
            <div className='row'>
              <div className='col s12'>
                <CardCarousel cards={storyCards} infinite={false} t={this.t} />
              </div>
            </div>
            <div className='row center-align' style={{marginTop: '35px', marginBottom: '10px'}}>
              <a href='/stories' className='btn'>{t('More Stories')}</a>
            </div>
          </div>
          <div className='divider' />
          <div className='row no-margin'>
            <div className='row no-margin' style={{height: '50px'}}>
              <div className='col s12 m2 l1'>
                <a href='/maps'>
                  <h5 className='home-section no-margin' style={{lineHeight: '50px'}}>{t('Maps')}</h5>
                </a>
              </div>
              <div className='col s12 m6 l7 valign-wrapper' style={{height: '50px'}} />
              <div className='col s12 m4 l4 valign-wrapper' style={{height: '100%'}}>
                <CardFilter defaultValue={this.state.mapMode} onChange={(value) => { _this.setState({mapMode: value}) }} />
              </div>
            </div>
            <div className='row'>
              <div className='col s12'>
                <CardCarousel cards={mapCards} infinite={false} t={this.t} />
              </div>
            </div>
            <div className='row center-align' style={{marginTop: '35px', marginBottom: '10px'}}>
              <a href='/maps' className='btn'>{t('More Maps')}</a>
            </div>
          </div>
          <div className='divider' />
          <div className='row no-margin'>
            <div className='row no-margin' style={{height: '50px'}}>
              <div className='col s12 m2 l1'>
                <a href='/groups'>
                  <h5 className='home-section no-margin' style={{lineHeight: '50px'}}>{t('Groups')}</h5>
                </a>
              </div>
              <div className='col s12 m6 l7 valign-wrapper' style={{height: '50px'}} />
              <div className='col s12 m4 l4 valign-wrapper' style={{height: '100%'}}>
                <CardFilter defaultValue={this.state.groupMode} onChange={(value) => { _this.setState({groupMode: value}) }} />
              </div>
            </div>
            <div className='row'>
              <div className='col s12'>
                <CardCarousel cards={groupCards} infinite={false} t={this.t} />
              </div>
            </div>
            <div className='row center-align' style={{marginTop: '35px', marginBottom: '10px'}}>
              <a href='/groups' className='btn'>{t('More Groups')}</a>
            </div>
          </div>
          <div className='divider' />
          <div className='row no-margin'>
            <div className='row no-margin' style={{height: '50px'}}>
              <div className='col s12 m2 l1'>
                <a href='/layers'>
                  <h5 className='home-section no-margin' style={{lineHeight: '50px'}}>{t('Layers')}</h5>
                </a>
              </div>
              <div className='col s12 m6 l7 valign-wrapper' style={{height: '50px'}} />
              <div className='col s12 m4 l4 valign-wrapper' style={{height: '100%'}}>
                <CardFilter defaultValue={this.state.layerMode} onChange={(value) => { _this.setState({layerMode: value}) }} />
              </div>
            </div>
            <div className='row'>
              <div className='col s12'>
                <CardCarousel cards={layerCards} infinite={false} t={t} />
              </div>
            </div>
            <div className='row center-align' style={{marginTop: '35px', marginBottom: '10px'}}>
              <a href='/layers' className='btn'>{t('More Layers')}</a>
            </div>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
