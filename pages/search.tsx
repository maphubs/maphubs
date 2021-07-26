import React, { useState, useEffect, useCallback } from 'react'
import Layout from '../src/components/Layout'
import { Row, message, notification } from 'antd'
import SearchBox from '../src/components/SearchBox'
import CardCollection from '../src/components/CardCarousel/CardCollection'
import request from 'superagent'
import _shuffle from 'lodash.shuffle'
import ErrorBoundary from '../src/components/ErrorBoundary'
import type { CardConfig } from '../src/components/CardCarousel/Card'
import cardUtil from '../src/services/card-util'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import useT from '../src/hooks/useT'
import { useQueryParam, StringParam } from 'use-query-params'

const debug = DebugService('home')

const Search = (): JSX.Element => {
  const { t } = useT()
  const [q] = useQueryParam('q', StringParam)
  const [searchCards, setSearchCards] = useState<CardConfig[]>([])

  const handleSearch = useCallback(
    async (input: string): Promise<void> => {
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

        const searchCards = _shuffle([
          ...layerResults.map((layer) => cardUtil.getLayerCard(layer)),
          ...groupResults.map((group) => cardUtil.getGroupCard(group)),
          ...mapResults.map((map) => cardUtil.getMapCard(map)),
          ...storyResults.map((s) => cardUtil.getStoryCard(s, t))
        ])
        setSearchCards(searchCards)
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
    },
    [t]
  )

  useEffect(() => {
    if (q) {
      handleSearch(q)
    }
  }, [q, handleSearch])

  return (
    <>
      <ErrorBoundary t={t}>
        <Layout title={t('Search')}>
          <Row>
            <div
              className='container'
              style={{
                height: '55px',
                paddingTop: '10px'
              }}
            >
              <SearchBox
                label={t('Search') + ' ' + process.env.NEXT_PUBLIC_PRODUCT_NAME}
                onSearch={handleSearch}
                onReset={() => {
                  setSearchCards([])
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
        </Layout>
      </ErrorBoundary>
    </>
  )
}
export default Search
