// @flow
const shapefileFairy = require('@mapbox/shapefile-fairy')

module.exports = function (path:string, options: Object) {
  return new Promise((resolve, reject) => {
    try {
      shapefileFairy(path, (result) => {
        resolve(result)
      }, options)
    } catch (err) {
      reject(err)
    }
  })
}
