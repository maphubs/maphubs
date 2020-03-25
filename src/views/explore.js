// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import SearchBox from '../components/SearchBox'
import CardCarousel from '../components/CardCarousel/CardCarousel'
import _shuffle from 'lodash.shuffle'
import CardFilter from '../components/Home/CardFilter'
import cardUtil from '../services/card-util'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import getConfig from 'next/config'
import { Row, Col, Button, Divider, Typography } from 'antd'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const { Title } = Typography

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
  layerMode: string
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
      layerMode: MAPHUBS_CONFIG.mapHubsPro ? 'popular' : 'featured'
    }
  }

  handleSearch = (input: string) => {
    window.location = '/search?q=' + input
  }

  render () {
    const {t, props} = this
    const _this = this
    const {storyMode, mapMode, groupMode, layerMode} = this.state

    let storyCards = []
    if (storyMode === 'featured') {
      storyCards = _shuffle(props.featuredStories.map(s => cardUtil.getStoryCard(s, t)))
    } else if (storyMode === 'popular') {
      storyCards = _shuffle(props.popularStories.map(s => cardUtil.getStoryCard(s, t)))
    } else if (storyMode === 'recent') {
      storyCards = _shuffle(props.recentMaps.map(cardUtil.getMapCard))
    }

    let mapCards = []
    if (mapMode === 'featured') {
      mapCards = _shuffle(props.featuredMaps.map(cardUtil.getMapCard))
    } else if (mapMode === 'popular') {
      mapCards = _shuffle(props.popularMaps.map(cardUtil.getMapCard))
    } else if (mapMode === 'recent') {
      mapCards = _shuffle(props.recentMaps.map(cardUtil.getMapCard))
    }

    let groupCards = []
    if (groupMode === 'featured') {
      groupCards = _shuffle(props.featuredGroups.map(cardUtil.getGroupCard))
    } else if (groupMode === 'popular') {
      groupCards = _shuffle(props.popularGroups.map(cardUtil.getGroupCard))
    } else if (groupMode === 'recent') {
      groupCards = _shuffle(props.recentGroups.map(cardUtil.getGroupCard))
    }

    let layerCards = []
    if (layerMode === 'featured') {
      layerCards = _shuffle(props.featuredLayers.map(cardUtil.getLayerCard))
    } else if (layerMode === 'popular') {
      layerCards = _shuffle(props.popularLayers.map(cardUtil.getLayerCard))
    } else if (layerMode === 'recent') {
      layerCards = _shuffle(props.recentLayers.map(cardUtil.getLayerCard))
    }

    return (
      <ErrorBoundary>
        <Header activePage='explore' {...this.props.headerConfig} />
        <main style={{margin: 0, padding: '10px'}}>
          <Row justify='end' style={{marginBottom: '20px'}}>
            <Col sm={24} md={6}>
              <SearchBox label={t('Search') + ' ' + MAPHUBS_CONFIG.productName} onSearch={this.handleSearch} />
            </Col>
          </Row>
          <Row style={{width: '100%', marginBottom: '20px'}}>
            <Row style={{height: '50px', width: '100%', position: 'relative'}}>
              <div style={{position: 'absolute', right: '10px', top: '5px'}}>
                <CardFilter defaultValue={this.state.storyMode} onChange={(value) => { _this.setState({storyMode: value}) }} />
              </div>
              <a href='/stories'>
                <Title level={2}>{t('Stories')}</Title>
              </a>
            </Row>
            <Row style={{width: '100%', marginBottom: '20px'}}>
              <CardCarousel cards={storyCards} infinite={false} t={t} />
            </Row>
            <Row justify='center' align='middle' style={{height: '45px', width: '100%'}}>
              <Button type='primary' href='/stories'>{t('More Stories')}</Button>
            </Row>
          </Row>
          <div className='divider' />
          <Row style={{width: '100%', marginBottom: '20px'}}>
            <Row style={{height: '50px', width: '100%', position: 'relative'}}>
              <div style={{position: 'absolute', right: '10px', top: '5px'}}>
                <CardFilter defaultValue={this.state.mapMode} onChange={(value) => { _this.setState({mapMode: value}) }} />
              </div>
              <a href='/maps'>
                <Title level={2}>{t('Maps')}</Title>
              </a>
            </Row>
            <Row style={{width: '100%', marginBottom: '20px'}}>
              <CardCarousel cards={mapCards} infinite={false} t={this.t} />
            </Row>
            <Row justify='center' align='middle' style={{height: '45px', width: '100%'}}>
              <Button type='primary' href='/maps'>{t('More Maps')}</Button>
            </Row>
          </Row>
          <div className='divider' />
          <Row style={{width: '100%', marginBottom: '20px'}}>
            <Row style={{height: '50px', width: '100%', position: 'relative'}}>
              <div style={{position: 'absolute', right: '10px', top: '5px'}}>
                <CardFilter defaultValue={this.state.groupMode} onChange={(value) => { _this.setState({groupMode: value}) }} />
              </div>
              <a href='/groups'>
                <Title level={2}>{t('Groups')}</Title>
              </a>
            </Row>
            <Row style={{width: '100%', marginBottom: '20px'}}>
              <CardCarousel cards={groupCards} infinite={false} t={this.t} />
            </Row>
            <Row justify='center' align='middle' style={{height: '45px', width: '100%'}}>
              <Button type='primary' href='/groups'>{t('More Groups')}</Button>
            </Row>
          </Row>
          <Divider />
          <Row style={{width: '100%', marginBottom: '20px'}}>
            <Row style={{height: '50px', width: '100%', position: 'relative'}}>
              <div style={{position: 'absolute', right: '10px', top: '5px'}}>
                <CardFilter defaultValue={this.state.layerMode} onChange={(value) => { _this.setState({layerMode: value}) }} />
              </div>
              <a href='/layers'>
                <Title level={2}>{t('Layers')}</Title>
              </a>
            </Row>
            <Row style={{width: '100%', marginBottom: '20px'}}>
              <CardCarousel cards={layerCards} infinite={false} t={t} />
            </Row>
            <Row justify='center' align='middle' style={{height: '45px', width: '100%'}}>
              <Button type='primary' href='/layers'>{t('More Layers')}</Button>
            </Row>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
