import MapStyles from '../components/Maps/Map/Styles'
import _buffer from '@turf/buffer'
import _bbox from '@turf/bbox'
import knex from '../connection'
import GJV from 'geojson-validation'
import log from '@bit/kriscarle.maphubs-utils.maphubs-utils.log'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import fs from 'fs'
import LayerViews from './layer-views'
import Bluebird from 'bluebird'
import ogr2ogr from 'ogr2ogr'
import { Knex } from 'knex'
import { BBox, FeatureCollection } from 'geojson'

const debug = DebugService('data-load-utils')

export default {
  async removeLayerData(
    layer_id: number,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    debug.log('removeLayerData')
    let db = knex

    if (trx) {
      db = trx
    }

    // remove views
    const result = await db('omh.layers').select('status').where({
      layer_id
    })

    if (result && result.length > 0) {
      const status = result[0].status

      if (status === 'published' || status === 'loaded') {
        debug.log('dropping layer views')
        await LayerViews.dropLayerViews(layer_id, trx)
        debug.log('dropping layer data')
        await db.raw(`DROP TABLE layers.data_${layer_id};`)
        debug.log('dropping layer sequence')
        return db.raw(`DROP SEQUENCE layers.mhid_seq_${layer_id};`)
      } else {
        return false
      }
    } else {
      return false
    }
  },

  async storeTempShapeUpload(
    uploadtmppath: string,
    layer_id: number,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    debug.log('storeTempShapeUpload')
    let db = knex

    if (trx) {
      db = trx
    }

    await db('omh.temp_data')
      .where({
        layer_id
      })
      .del()
    return db('omh.temp_data').insert({
      layer_id,
      uploadtmppath
    })
  },

  async getTempShapeUpload(
    layer_id: number,
    trx?: Knex.Transaction
  ): Promise<string> {
    debug.log('getTempShapeUpload')
    let db = knex

    if (trx) {
      db = trx
    }

    const result = await db('omh.temp_data').where({
      layer_id
    })
    return result[0].uploadtmppath
  },

  async getBBox(layer_id: number): Promise<BBox> {
    const layerTable = `layers.data_${layer_id}`
    const bbox = await knex.raw(
      "select '[' || ST_XMin(bbox)::float || ',' || ST_YMin(bbox)::float || ',' || ST_XMax(bbox)::float || ',' || ST_YMax(bbox)::float || ']' as bbox from (select ST_Extent(wkb_geometry) as bbox from :layerTable:) a",
      {
        layerTable
      }
    )
    return JSON.parse(bbox.rows[0].bbox)
  },

  cleanProps(props: Record<string, any>, uniqueProps: Record<string, any>): {} {
    // get unique list of properties
    const cleanedFeatureProps = {}
    for (let key of Object.keys(props)) {
      // ignore MapHubs ID fields
      if (key !== 'mhid' && key !== 'layer_id' && key !== 'osm_id') {
        let val = props[key]
        // remove chars that can't be in database fields (used in PostGIS views)
        key = key.replace(/-/g, '_')
        key = key.replace(/'/g, "''")

        if (!uniqueProps.includes(key)) {
          uniqueProps.push(key)
        }

        if (typeof val === 'string') {
          val = val.replace(/\r?\n/g, ' ')
        }

        if (typeof val === 'object') {
          // log.info('converting nested object to string: ' + key);
          val = JSON.stringify(val)
        }

        cleanedFeatureProps[key] = val
      }
    }
    return cleanedFeatureProps
  },

  async insertTempGeoJSONIntoDB(
    geoJSON: FeatureCollection,
    layer_id: number
  ): Promise<boolean | void> {
    const ogr = ogr2ogr(geoJSON)
      .format('PostgreSQL')
      .skipfailures()
      .options(['-t_srs', 'EPSG:4326', '-nln', `layers.temp_${layer_id}`])
      .destination(
        `PG:host=${process.env.DB_HOST} user=${process.env.DB_USER} dbname=${process.env.DB_NAME} password=${process.env.DB_PASS}`
      )
      .timeout(1_200_000)
    await Bluebird.promisify(ogr.exec, {
      context: ogr
    })()
    return knex.transaction(async (trx) => {
      await trx.raw(`CREATE TABLE layers.data_${layer_id} AS 
        SELECT mhid, wkb_geometry, tags::jsonb FROM layers.temp_${layer_id};`)
      // set mhid as primary key
      await trx.raw(
        `ALTER TABLE layers.data_${layer_id} ADD PRIMARY KEY (mhid);`
      )
      // create index
      await trx.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
                      ON layers.data_${layer_id}
                      USING gist
                      (wkb_geometry);`)
      // drop temp data
      await trx.raw(`DROP TABLE layers.temp_${layer_id};`)
      // get count and create sequence
      const result = await trx.raw(
        `SELECT count(*) as cnt FROM layers.data_${layer_id};`
      )
      const maxVal = Number.parseInt(result.rows[0].cnt) + 1
      debug.log('creating sequence starting at: ' + maxVal)
      return trx.raw(
        `CREATE SEQUENCE layers.mhid_seq_${layer_id} START ${maxVal}`
      )
    })
  },

  async storeTempGeoJSON(
    geoJSON: FeatureCollection,
    uploadtmppath: string,
    layer_id: number,
    shortid: string,
    update: boolean,
    setStyle: boolean,
    trx?: Knex.Transaction
  ): Promise<{
    bbox: BBox
    data_type: string
    error: null
    success: boolean
    uniqueProps: Array<unknown>
  }> {
    debug.log('storeTempGeoJSON')
    const db = trx || knex
    const uniqueProps = []

    if (!geoJSON) {
      throw new Error('Error dataset missing.')
    }

    // confirm that it is a feature collection
    if (geoJSON.type === 'FeatureCollection') {
      // Error if the FeatureCollection is empty
      if (!geoJSON.features || geoJSON.features.length === 0) {
        throw new Error(
          'Dataset appears to be empty. Zero features found in FeatureCollection'
        )
      }

      const firstFeature = geoJSON.features[0]
      // get type and SRID from the first feature
      let geomType = ''
      let firstFeatureGeom

      if (GJV.isFeature(firstFeature)) {
        firstFeatureGeom = firstFeature.geometry
      } else {
        console.log(firstFeature)
        throw new Error(
          'first GeoJSON feature invalid, unable to process GeoJSON'
        )
      }

      if (
        GJV.isPolygon(firstFeatureGeom) ||
        GJV.isMultiPolygon(firstFeatureGeom)
      ) {
        geomType = 'polygon'
      } else if (
        GJV.isLineString(firstFeatureGeom) ||
        GJV.isMultiLineString(firstFeatureGeom)
      ) {
        geomType = 'line'
      } else if (
        GJV.isPoint(firstFeatureGeom) ||
        GJV.isMultiPoint(firstFeatureGeom)
      ) {
        geomType = 'point'
      } else {
        log.error('unsupported data type: ' + JSON.stringify(firstFeatureGeom))
      }

      const cleanedFeatures = []
      // loop through features
      geoJSON.features.map((feature, i) => {
        // get unique list of properties
        const cleanedFeatureProps = this.cleanProps(
          feature.properties,
          uniqueProps
        )

        const mhid = `${layer_id}:${i + 1}`
        feature.properties = {
          mhid,
          tags: JSON.stringify(cleanedFeatureProps)
        }

        if (GJV.isFeature(feature) && feature.geometry) {
          cleanedFeatures.push(feature)
        } else {
          log.warn('Skipping invalid GeoJSON feature')
        }
      })
      geoJSON.features = cleanedFeatures
      const updateData = {
        data_type: geomType,
        style: undefined,
        extent_bbox: undefined
      }

      if (setStyle) {
        // now that we know the data type, update the style to clear uneeded default styles
        const style = MapStyles.style.defaultStyle(
          layer_id,
          shortid,
          'vector',
          geomType
        )
        updateData.style = style
      }

      if (process.env.WRITE_DEBUG_DATA === 'true') {
        /* eslint-disable security/detect-non-literal-fs-filename */
        // temp file path is build using env var + GUID, not user input
        fs.writeFile(
          uploadtmppath + '.geojson',
          JSON.stringify(geoJSON),
          (err) => {
            if (err) log.error(err)
            debug.log('wrote temp geojson to ' + uploadtmppath + '.geojson')
          }
        )
      }

      try {
        await this.insertTempGeoJSONIntoDB(geoJSON, layer_id)
      } catch (err) {
        log.error(err)
        throw new Error('Failed to Insert Data into Temp POSTGIS Table')
      }

      let bbox

      if (
        geoJSON.features.length === 1 &&
        geoJSON.features[0].geometry.type === 'Point'
      ) {
        // buffer the Point
        const buffered = _buffer(geoJSON.features[0], 500, {
          units: 'meters'
        })

        bbox = _bbox(buffered)
      } else {
        bbox = await this.getBBox(layer_id)
      }

      debug.log(bbox)
      updateData.extent_bbox = JSON.stringify(bbox)
      log.info('uniqueProps: ' + JSON.stringify(uniqueProps))
      debug.log('inserting temp geojson into database')
      // insert into the database
      await db('omh.layers')
        .where({
          layer_id
        })
        .update(updateData)

      if (update) {
        debug.log('Update temp geojson')
        await db('omh.temp_data')
          .update({
            unique_props: JSON.stringify(uniqueProps)
          })
          .where({
            layer_id
          })
      } else {
        // delete and replace
        await db('omh.temp_data')
          .where({
            layer_id
          })
          .del()
        await db('omh.temp_data').insert({
          layer_id,
          uploadtmppath,
          unique_props: JSON.stringify(uniqueProps)
        })
      }

      debug.log('Upload Complete!')
      return {
        success: true,
        error: null,
        uniqueProps,
        data_type: geomType,
        bbox
      }
    } else {
      throw new Error('Data is not a valid GeoJSON FeatureCollection')
    }
  },

  async createEmptyDataTable(
    layer_id: number,
    trx: Knex.Transaction
  ): Promise<boolean> {
    await trx.raw(`CREATE TABLE layers.data_${layer_id}
     (
       mhid text, 
       wkb_geometry geometry(Geometry, 4326),
       tags jsonb
     )`)
    await trx.raw(`ALTER TABLE layers.data_${layer_id} ADD PRIMARY KEY (mhid);`)
    await trx.raw(`CREATE INDEX data_${layer_id}_wkb_geometry_geom_idx
      ON layers.data_${layer_id}
      USING gist
      (wkb_geometry);`)
    return trx.raw(`CREATE SEQUENCE layers.mhid_seq_${layer_id} START 1`)
  },

  async loadTempData(layer_id: number, trx: Knex.Transaction): Promise<number> {
    return trx('omh.layers')
      .update({
        status: 'loaded'
      })
      .where({
        layer_id
      })
  }
}
