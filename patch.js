var semver = require('semver')
var fs = require('fs')
var version = require('./version.json').version
console.log('previous version: ' + version)
var patch = semver.inc(version, 'patch')

fs.writeFile('./version.json', JSON.stringify({'version': patch}), (err) => {
  if (err) {
    console.error(err)
  } else {
    console.log(version + ' -> ' + patch)
  }
})
