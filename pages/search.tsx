import React from 'react'
import Head from 'next/head'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, message, notification } from 'antd'
import SearchBox from '../src/components/SearchBox'
import CardCollection from '../src/components/CardCarousel/CardCollection'
import request from 'superagent'
import _shuffle from 'lodash.shuffle'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import type { CardConfig } from '../src/components/CardCarousel/Card'
import UserStore from '../src/stores/UserStore'
import cardUtil from '../src/services/card-util'
import getConfig from 'next/config'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Layer } from '../src/types/layer'
import { Group } from '../src/types/group'
import { Story } from '../src/types/story'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const debug = DebugService('home')

type Props = {
  locale: string
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  mapConfig: Record<string, any>
  _csrf: string
  user: Record<string, any>
}
type State = {
  searchResult: any
  searchCards: Array<CardConfig>
}
export default class Search extends React.Component<Props, State> {
  state: State = {
    searchResult: null,
    searchCards: []
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
  }

  getParameterByName: any | ((name: string, url: any) => null | string) = (
    name: string,
    url: any
  ) => {
    if (!url) url = window.location.href
    url = url.toLowerCase() // This is just to avoid case sensitiveness

    name = name.replace(/[[\]]/g, '\\$&').toLowerCase() // This is just to avoid case sensitiveness for query parameter name

    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    const results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  componentDidMount(): void {
    const q = this.getParameterByName('q')

    if (q) {
      this.handleSearch(q)
    }
  }

  onResetSearch = (): void => {
    this.setState({
      searchResult: null,
      searchCards: []
    })
  }
  handleSearch = async (input: string): Promise<void> => {
    const { t } = this
    const closeSearchingMessage = message.loading(t('Searching'), 0)

    try {
      let totalResults = 0
      const layerRes = await request
        .get(`/api/layers/search?q=${input}`)
        .type('json')
        .accept('json')
      const groupRes = await request
        .get(`/api/groups/search?q=${input}`)
        .type('json')
        .accept('json')
      const mapRes = await request
        .get(`/api/maps/search?q=${input}`)
        .type('json')
        .accept('json')
      let layerResults = []
      let groupResults = []
      let mapResults = []
      const storyResults = []

      // layers
      if (
        layerRes.body &&
        layerRes.body.layers &&
        layerRes.body.layers.length > 0
      ) {
        totalResults += layerRes.body.layers.length
        layerResults = layerRes.body.layers
      }

      // groups
      if (
        groupRes.body &&
        groupRes.body.groups &&
        groupRes.body.groups.length > 0
      ) {
        totalResults += groupRes.body.groups.length
        groupResults = groupRes.body.groups
      }

      // maps
      if (mapRes.body && mapRes.body.maps && mapRes.body.maps.length > 0) {
        totalResults += mapRes.body.maps.length
        mapResults = mapRes.body.maps
      }

      const searchCards = this.getMixedCardSet(
        layerResults,
        groupResults,
        mapResults,
        storyResults
      )
      this.setState({
        searchCards
      })
      closeSearchingMessage()

      if (totalResults > 0) {
        message.info(`${totalResults} ${t('Results Found')}`)
      } else {
        // clear Map
        // tell user no results found
        message.info(t('No Results Found'))
      }
    } catch (err) {
      closeSearchingMessage()
      debug.error(err)
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  getMixedCardSet(
    layers: Layer[],
    groups: Group[],
    maps: Array<Record<string, any>>,
    stories: Story[]
  ): any {
    return _shuffle([
      ...layers.map((layer) => cardUtil.getLayerCard(layer)),
      ...groups.map((group) => cardUtil.getGroupCard(group)),
      ...maps.map((map) => cardUtil.getMapCard(map)),
      ...stories.map((s) => cardUtil.getStoryCard(s, this.t))
    ])
  }
  t = (v) => v

  render(): JSX.Element {
    const { t, props, state, handleSearch } = this
    const { headerConfig, footerConfig } = props
    const { searchCards } = state
    return (
      <>
        <Head>
          <title>{`t('Search') - ${MAPHUBS_CONFIG.productName}`}</title>
        </Head>
        <ErrorBoundary>
          <Header {...headerConfig} />
          <main
            style={{
              margin: 0
            }}
          >
            <Row>
              <div
                ref='search'
                className='container'
                style={{
                  height: '55px',
                  paddingTop: '10px'
                }}
              >
                <SearchBox
                  label={t('Search') + ' ' + MAPHUBS_CONFIG.productName}
                  onSearch={handleSearch}
                  onReset={() => {
                    this.onResetSearch()
                  }}
                />
              </div>
            </Row>
            <Row
              style={{
                height: 'calc(100% - 50px)',
                minHeight: '200px'
              }}
            >
              {searchCards && searchCards.length > 0 && (
                <CardCollection cards={searchCards} t={t} />
              )}
            </Row>
          </main>
          <Footer t={t} {...footerConfig} />
        </ErrorBoundary>
      </>
    )
  }
}
