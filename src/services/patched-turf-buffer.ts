// Patched turf buffer until https://github.com/Turfjs/turf/issues/1112 is resolved...
import center from '@turf/center'
import turfBbox from '@turf/bbox'
import { BufferOp, GeoJSONReader, GeoJSONWriter } from 'turf-jsts'
import { toWgs84, toMercator } from '@turf/projection'
import { geomEach, featureEach } from '@turf/meta'
import { geoTransverseMercator } from 'd3-geo'
import {
  feature,
  featureCollection,
  radiansToLength,
  lengthToRadians,
  earthRadius,
  FeatureCollection
} from '@turf/helpers'
import { Geometry } from 'geojson'

/**
 * Calculates a buffer for input features for a given radius. Units supported are miles, kilometers, and degrees.
 *
 * When using a negative radius, the resulting geometry may be invalid if
 * it's too small compared to the radius magnitude. If the input is a
 * FeatureCollection, only valid members will be returned in the output
 * FeatureCollection - i.e., the output collection may have fewer members than
 * the input, or even be empty.
 *
 * @name buffer
 * @param {FeatureCollection|Geometry|Feature<any>} geojson input to be buffered
 * @param {number} radius distance to draw the buffer (negative values are allowed)
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units="kilometers"] any of the options supported by turf units
 * @param {number} [options.steps=64] number of steps
 * @returns {FeatureCollection|Feature<Polygon|MultiPolygon>|undefined} buffered features
 * @example
 * var point = turf.point([-90.548630, 14.616599]);
 * var buffered = turf.buffer(point, 500, {units: 'miles'});
 *
 * //addToMap
 * var addToMap = [point, buffered]
 */
function buffer(geojson, radius, options) {
  // Optional params
  options = options || {}
  let units = options.units
  let steps = options.steps || 64
  // validation
  if (!geojson) throw new Error('geojson is required')
  if (typeof options !== 'object') throw new Error('options must be an object')
  if (typeof steps !== 'number') throw new Error('steps must be an number')
  // Allow negative buffers ("erosion") or zero-sized buffers ("repair geometry")
  if (radius === undefined) throw new Error('radius is required')
  if (steps <= 0) throw new Error('steps must be greater than 0')
  // default params
  steps = steps || 64
  units = units || 'kilometers'
  const results = []

  switch (geojson.type) {
    case 'GeometryCollection':
      geomEach(geojson, function (geometry) {
        const buffered = bufferFeature(geometry, radius, units, steps)
        if (buffered) results.push(buffered)
      })
      return featureCollection(results)

    case 'FeatureCollection':
      featureEach(geojson, function (feature) {
        const multiBuffered = bufferFeature(feature, radius, units, steps)

        if (multiBuffered) {
          featureEach(multiBuffered, function (buffered) {
            if (buffered) results.push(buffered)
          })
        }
      })
      return featureCollection(results)
  }

  return bufferFeature(geojson, radius, units, steps)
}

/**
 * Buffer single Feature/Geometry
 *
 * @private
 * @param {Feature<any>} geojson input to be buffered
 * @param {number} radius distance to draw the buffer
 * @param {string} [units='kilometers'] any of the options supported by turf units
 * @param {number} [steps=64] number of steps
 * @returns {Feature<Polygon|MultiPolygon>} buffered feature
 */
function bufferFeature(geojson, radius, units, steps): FeatureCollection {
  const properties = geojson.properties || {}
  const geometry = geojson.type === 'Feature' ? geojson.geometry : geojson

  // Geometry Types faster than jsts
  if (geometry.type === 'GeometryCollection') {
    const results = []
    geomEach(geojson, function (geometry) {
      const buffered = bufferFeature(geometry, radius, units, steps)
      if (buffered) results.push(buffered)
    })
    return featureCollection(results)
  }

  // Project GeoJSON to Transverse Mercator projection (convert to Meters)
  const bbox = turfBbox(geojson)
  const needsTransverseMercator = bbox[1] > 50 && bbox[3] > 50

  const projected = needsTransverseMercator
    ? {
        type: geometry.type,
        coordinates: projectCoords(
          geometry.coordinates,
          defineProjection(geometry)
        )
      }
    : toMercator(geometry)

  // JSTS buffer operation
  const reader = new GeoJSONReader()
  const geom = reader.read(projected)
  const distance = radiansToLength(lengthToRadians(radius, units), 'meters')
  let buffered = BufferOp.bufferOp(geom, distance, steps)
  const writer = new GeoJSONWriter()
  buffered = writer.write(buffered)
  // Detect if empty geometries
  if (coordsIsNaN(buffered.coordinates)) return
  // Unproject coordinates (convert to Degrees)

  const result = needsTransverseMercator
    ? {
        type: buffered.type,
        coordinates: unprojectCoords(
          buffered.coordinates,
          defineProjection(geometry)
        )
      }
    : toWgs84(buffered)

  return result.geometry ? result : feature(result, properties)
}

/**
 * Coordinates isNaN
 *
 * @private
 * @param {Array<any>} coords GeoJSON Coordinates
 * @returns {boolean} if NaN exists
 */
function coordsIsNaN(coords) {
  if (Array.isArray(coords[0])) return coordsIsNaN(coords[0])
  return Number.isNaN(coords[0])
}

/**
 * Project coordinates to projection
 *
 * @private
 * @param {Array<any>} coords to project
 * @param {GeoProjection} proj D3 Geo Projection
 * @returns {Array<any>} projected coordinates
 */
function projectCoords(coords, proj) {
  if (typeof coords[0] !== 'object') return proj(coords)
  return coords.map(function (coord) {
    return projectCoords(coord, proj)
  })
}

/**
 * Un-Project coordinates to projection
 *
 * @private
 * @param {Array<any>} coords to un-project
 * @param {GeoProjection} proj D3 Geo Projection
 * @returns {Array<any>} un-projected coordinates
 */
function unprojectCoords(coords, proj) {
  if (typeof coords[0] !== 'object') return proj.invert(coords)
  return coords.map(function (coord) {
    return unprojectCoords(coord, proj)
  })
}

/**
 * Define Transverse Mercator projection
 *
 * @private
 * @param {Geometry|Feature<any>} geojson Base projection on center of GeoJSON
 * @returns {GeoProjection} D3 Geo Transverse Mercator Projection
 */
function defineProjection(geojson) {
  const coords = center(geojson).geometry.coordinates.reverse()
  const rotate = coords.map(function (coord) {
    return -coord
  })
  return geoTransverseMercator()
    .center(coords)
    .rotate(rotate)
    .scale(earthRadius)
}

export default buffer
