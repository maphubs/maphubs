// @flow
var _map = require('lodash.map');
var _min = require('lodash.min');
var _max = require('lodash.max');
var _every = require('lodash.every');
var _filter = require('lodash.filter');
var ratio: number = require('./ratio.js');
var maxArea: number = require('./max-area.js');

var nullLatLon: Array<any> = [null,null,null,null];
var lonLimit: number = 180.0;
var latLimit: number = 90.0;

// In OSM, the order goes min_lon, min_lat, max_lon, max_lat.
// All bounding box checks assume the input is unscaled.
function Bbox(minMaxLatLon: Array<number>) {

  //TODO: not sure if this parse is needed as long as types are enforced below
  var bounds: Array<number> = _map(minMaxLatLon, parseFloat);

  // Check that coordinates exist and are numbers
  // Check that the min/max makes sense
  if (!this.isValidBounds(bounds)) {
    this.logError('Latitude/longitude bounds must be valid coordinates.');
  }
  else if (bounds[0] > bounds[2]) {
    this.logError('The minimum longitude must be less than the maximum, but is not.');
  }
  else if (bounds[1] > bounds[3]) {
    this.logError('The minimum latitude must be less than the maximum, but is not.');
  }
  else if (bounds[0] < -lonLimit ||
      bounds[1] < -latLimit ||
      bounds[2] > +lonLimit ||
      bounds[3] > +latLimit) {
    this.logError('Latitudes and longitudes are not within bounds.');
  }

  else if ((bounds[2] - bounds[0]) * (bounds[3] - bounds[1]) > maxArea) {
    var requestArea = (bounds[2] - bounds[0]) * (bounds[3] - bounds[1]);
    this.logError('Request area: ' + requestArea + ' is greater than maximum request area: ' + maxArea);
  }
  else {
    this.error = null;
  }

  if (this.error) {
    bounds = nullLatLon;
  }

  this.minLon = bounds[0];
  this.minLat = bounds[1];
  this.maxLon = bounds[2];
  this.maxLat = bounds[3];
  return this;
}

Bbox.prototype.logError = function(msg: string) {
  this.error = msg;
};

Bbox.prototype.area = function() {
  return (this.maxLon - this.minLon) * (this.maxLat - this.minLat);
};

Bbox.prototype.centerLon = function() {
  return (this.minLon + this.maxLon) / 2.0;
};

Bbox.prototype.centerLat = function() {
  return (this.minLat + this.maxLat) / 2.0;
};

Bbox.prototype.width = function(): number {
  return this.maxLon - this.minLon;
};

Bbox.prototype.height = function(): number {
  return this.maxLat - this.minLat;
};

Bbox.prototype.toArray = function(): Array<number> {
  return [this.minLon, this.minLat, this.maxLon, this.maxLat];
};

Bbox.prototype.toString = function(): string {
  return this.toArray().join(',');
};

Bbox.prototype.toScaled = function() {
  this.minLon *= ratio;
  this.minLat *= ratio;
  this.maxLon *= ratio;
  this.maxLat *= ratio;
  return this;
};

Bbox.prototype.isValidBounds = function(bounds: Array<number>) {
  if(bounds.length !== 4) return false;
  for(var i = 0; i < 4; ++i) {
    var coord: number = bounds[i];
    if (typeof coord === 'undefined' || isNaN(coord)) {
      return false;
    }
  }
  return true;
};

var getBbox = {
  FromCoordinates(coordinates: Array<number>) {
    if (_every(coordinates, (coordinate) => {
      return coordinate && !isNaN(coordinate);
    })) {
      return new Bbox(coordinates);
    }
    else {
      return new Bbox(nullLatLon);
    }
  },
  FromScaledActions(actions: any) {
    var lat: Array<number> = [];
    var lon: Array<number> = [];
    var nodes = _filter(actions, (action) => {
      return action.model === 'node';
    });
    for(var i = 0, ii = nodes.length; i < ii; ++i) {
      var attributes = nodes[i].attributes;
      lon.push(parseFloat(attributes.longitude));
      lat.push(parseFloat(attributes.latitude));
    }
    return new Bbox([
      _min(lon) / ratio,
      _min(lat) / ratio,
      _max(lon) / ratio,
      _max(lat) / ratio
    ]);
  },
  FromNodes(nodes: Array<Object>) {
    var lat: Array<number> = [];
    var lon: Array<number> = [];
    for(var i = 0, ii = nodes.length; i < ii; ++i) {
      var node = nodes[i];
      lon.push(parseFloat(node.lon));
      lat.push(parseFloat(node.lat));
    }
    return new Bbox([_min(lon), _min(lat), _max(lon), _max(lat)]);
  }
};

module.exports = getBbox;
