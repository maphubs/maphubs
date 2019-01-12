// @flow
const client = require('../services/elasticsearch').getClient()
const Feature = require('../models/feature')
const local = require('../local')
const log = require('@bit/kriscarle.maphubs-utils.services.log')
const _centroid = require('@turf/centroid')
const knex = require('../connection')
const Promise = require('bluebird')

module.exports = {

  searchIndexName: local.elasticSearchIndexName ? local.elasticSearchIndexName : 'maphubs',

  /**
  * Delete an existing index
  */
  deleteIndex () {
    return client.indices.delete({
      index: this.searchIndexName
    })
  },

  /**
  * create the index
  */
  initIndex () {
    return client.indices.create({
      'index': this.searchIndexName,
      'body': {
        'mappings': {
          'feature': {
            'properties': {
              'location': {
                'type': 'geo_point'
              }
            }
          }
        }
      }
    })
  },

  /**
  * check if the index exists
  */
  indexExists () {
    return client.indices.exists({
      index: this.searchIndexName
    })
  },

  async rebuildFeatures () {
    const _this = this
    // delete all existing features
    const layers = await knex('omh.layers').select('layer_id').whereNot({
      is_external: true, remote: true, private: true, features_indexed: true
    })
    return Promise.mapSeries(layers, async (layer) => {
      try {
        await _this.updateLayer(layer.layer_id)
        return knex('omh.layers')
          .update({features_indexed: true})
          .where({layer_id: layer.layer_id})
      } catch (err) {
        log.error(err.message)
      }
    })
  },

  async updateLayer (layer_id: number, trx: any) {
    const _this = this
    const db = trx || knex
    log.info('Adding layer in search index: ' + layer_id)
    try {
      const mhidResults = await db(`layers.data_${layer_id}`).select('mhid')
      log.info('updating ' + mhidResults.length + ' features')
      return Promise.mapSeries(mhidResults, mhidResult => {
        return _this.updateFeature(layer_id, mhidResult.mhid, false, trx)
      })
    } catch (err) {
      log.error(err.message)
    }
  },

  async deleteLayer (layer_id: number, trx: any) {
    const _this = this
    const db = trx || knex
    try {
      log.info('Deleting layer form search index: ' + layer_id)
      const mhidResults = await db(`layers.data_${layer_id}`).select('mhid')
      log.info('deleting ' + mhidResults.length + ' features')
      return Promise.mapSeries(mhidResults, async mhidResult => {
        return _this.deleteFeature(mhidResult.mhid)
      })
    } catch (err) {
      log.error(err)
    }
  },

  async updateFeature (layer_id: number, mhid: string, refreshImmediately: boolean, trx: any): Promise<any> {
    const geoJSON = await Feature.getGeoJSON(mhid, layer_id, trx)
    const notes = await Feature.getFeatureNotes(mhid, layer_id, trx)
    const feature = geoJSON.features[0]

    // HACK: elasticsearch doesn't like null or improperly formatted fields called 'timestamp';
    delete feature.properties.timestamp

    let centroid
    if (feature.geometry.type === 'Point') {
      centroid = feature
    } else {
      centroid = _centroid(geoJSON)
    }

    // convert props to array
    const props = Object.keys(feature.properties).map(key => {
      const val = JSON.stringify(feature.properties[key])
      return {key, val}
    })

    // update feature
    const result = await client.index({
      index: this.searchIndexName,
      type: 'feature',
      id: mhid,
      refresh: refreshImmediately,
      body: {
        layer_id,
        mhid,
        location: {
          lat: centroid.geometry.coordinates[1],
          lon: centroid.geometry.coordinates[0]
        },
        properties: props,
        notes,
        published: true,
        timeout: '60s'
      }
    }).catch(err => {
      log.error(err.message)
    })
    return result
  },

  deleteFeature (mhid: string) {
    return client.delete({
      index: this.searchIndexName,
      type: 'feature',
      id: mhid,
      timeout: '60s'
    }).catch(err => {
      log.error(err.message)
    })
  },

  async queryFeatures (query: string) {
    const results = await client.search(
      {
        index: this.searchIndexName,
        type: 'feature',
        size: 1000,
        body: {
          query: {
            'query_string': {
              'query': query + '*'
            }
          }
        },
        timeout: '60s'
      }
    )
    if (results && results.hits && results.hits.hits) {
      return results.hits.hits
    }
    return null
  },

  updateStory () {

  },

  updateMap () {

  },

  updateHub () {

  }

}
