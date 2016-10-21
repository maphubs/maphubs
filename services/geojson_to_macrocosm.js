var log = require('./log');

module.exports = function(geo, changeset, osmChange, start, limit) {

  function append(obj, result) {
      result.node = result.node.concat(obj.node);
      result.way = result.way.concat(obj.way);
      if(obj.relation){
        result.relation = result.relation.concat(obj.relation);
      }
      return result;
  }

  function toMacrocosmJSON(geo, properties) {

    var result = {
        node: [],
        way: [],
        relation: []
      };

     properties = properties || {};

      switch (geo.type) {
          case 'Point':
              var coord = roundCoords([geo.coordinates]);
              var node = {
                id: count,
                lat: coord[0][1],
                lon:  coord[0][0],
                changeset
              };
              node.tag = propertiesToTagsJSON(properties);
              result.node.push(node);
              count--;
              break;

          case 'MultiPoint':
              break;
          case 'LineString':
              result = append(lineString(geo, properties), result); //if polygon is made with LineString,this working too.
              break;
          case 'MultiLineString':
              result = append(multiLineString(geo, properties), result);
              break;
          case 'Polygon':
              try{
                result = append(polygon(geo, properties), result);
              }catch(err){
                log.error(JSON.stringify(geo));
              }

              break;

          case 'MultiPolygon':
              var relation = {
                id: count,
                changeset,
                member: []
              };

              properties.type = 'multipolygon';
              count--;

              for (var i = 0; i < geo.coordinates.length; i++){

                  var poly = multipolygon({
                      'coordinates': geo.coordinates[i]
                  });

                  result.node = result.node.concat(poly.node);
                  result.way = result.way.concat(poly.way);

                  relation.member = relation.member.concat(poly.member);
              }

              relation.tag = propertiesToTagsJSON(properties);
              result.relation.push(relation);

              break;
      }




      return result;
  }


    function lineString(geo, properties) {
        var nodes = [];
        var coords = [];
        var way = {
          id: count,
          changeset
        };
        count--;
        for (var i = 0; i < geo.coordinates.length; i++) {
            coords.push([geo.coordinates[i][1], geo.coordinates[i][0]]);
        }
        coords = createNodes(coords);
        nodes = coords.nodes;
        way.nd = coords.nds;
        way.tag = propertiesToTagsJSON(properties);
        return {
            node: nodes,
            way: [way]
        };
    }

    function multiLineString(geo, properties) {
        var nodes = [];
        var coords = [];
        var way = {
          id: count,
          changeset
        };
        count--;
        for (var i = 0; i < geo.coordinates[0].length; i++) {
            coords.push([geo.coordinates[0][i][1], geo.coordinates[0][i][0]]);
        }
        coords = createNodes(coords);
        nodes = coords.nodes;
        way.nd = coords.nds;
        way.tag = propertiesToTagsJSON(properties);
        return {
            node: nodes,
            way: [way]
        };
    }

    //for multipolygons, we just collect all the ways as members
    function multipolygon(geo, properties) {
        var nodes = [],
            ways = [],
            members = [],
            role = '';
        properties = properties || {};

        var coords = [];
        if (geo.coordinates.length > 1) {
            // polygon with holes -> multipolygon

            count--;

            for (var i = 0; i < geo.coordinates.length; i++) {

                role = ((i === 0) ? 'outer' : 'inner');
                var member = {
                  type: "way",
                  ref: count,
                  role
                };
                members.push(member);

                var way = {
                  id: count,
                  changeset,
                  nd: []
                };
                count--;
                for (var a = 0; a < geo.coordinates[i].length; a++) {
                    coords.push([geo.coordinates[i][a][1], geo.coordinates[i][a][0]]);
                }
                coords = createNodes(coords);
                nodes = nodes.concat(coords.nodes);
                way.nd = way.nd.concat(coords.nds);
                coords = [];
                ways.push(way);
            }

        } else {
            // polygon -> way
             way = {
              id: count,
              changeset
            };

             member = {
              type: "way",
              ref: count,
              role: "outer"
            };
            members.push(member);

            count--;
            for (var j = 0; j < geo.coordinates[0].length; j++) {
                coords.push([geo.coordinates[0][j][1], geo.coordinates[0][j][0]]);
            }
            coords = createNodes(coords);
            nodes = nodes.concat(coords.nodes);
            way.nd = coords.nds;
            ways.push(way);
        }

        return {
            node: nodes,
            way: ways,
            member: members
        };

    }

    //returns a single way with area=true
    //or a multipolygon relation with 1 outer and 1-n inner rings
    function polygon(geo, properties) {
        var nodes = [],
            ways = [],
            relation = null,
            role = '';
        properties = properties || {};

        var coords = [];
        if (geo.coordinates.length > 1) {
            // polygon with holes -> multipolygon
            relation = {
              id: count,
              changeset,
              member: []
            };
            properties.type = 'multipolygon';
            count--;

            for (var i = 0; i < geo.coordinates.length; i++) {

                role = ((i === 0) ? 'outer' : 'inner');
                var member = {
                  type: "way",
                  ref: count,
                  role
                };
                relation.member.push(member);

                var way = {
                  id: count,
                  changeset,
                  nd: []
                };
                count--;
                for (var a = 0; a < geo.coordinates[i].length; a++) {
                    coords.push([geo.coordinates[i][a][1], geo.coordinates[i][a][0]]);
                }
                coords = createNodes(coords);
                nodes = nodes.concat(coords.nodes);
                way.nd = way.nd.concat(coords.nds);
                coords = [];
                ways.push(way);
            }

            relation.tag = propertiesToTagsJSON(properties);


        } else {
            // polygon -> way
             way = {
              id: count,
              changeset
            };

            count--;
            for (var j = 0; j < geo.coordinates[0].length; j++) {
                if(Array.isArray(geo.coordinates[0][j][0])){
                  throw new Error('Found array, expecting number: ' + JSON.stringify(geo.coordinates[0][j]));
                }
                coords.push([geo.coordinates[0][j][1], geo.coordinates[0][j][0]]);
            }
            coords = createNodes(coords);
            nodes = nodes.concat(coords.nodes);
            way.nd = coords.nds;
            way.tag = propertiesToTagsJSON(properties);

            way.tag.push({k: "area", v: "true"}); //flag this area as a polygon

            ways.push(way);
        }
        if(relation){
          return {
              node: nodes,
              way: ways,
              relation: [relation]
          };
        }else{
          return {
              node: nodes,
              way: ways
          };
        }
    }

    function propertiesToTagsJSON(properties) {
        var tags = [];
        for (var tag in properties) {
            if (properties[tag] !== null) {
                var value = properties[tag];
                if(value && typeof value === 'string'){
                  value = value.replace(/"/g,"'");
                  value = value.replace(/&(?!amp;)/g, "\&amp;");
                  value = value.replace(/</g,"\&lt;");
                  value = value.replace(/>/g,"\&gt;");
                }
                /*
                if(tag.toLowerCase() === 'area'){
                  tag = tag + '_import';
                }
                */
                tags.push({k: tag, v: value});
            }
        }
        return tags;
    }

    function roundCoords(coords){
        for (var a = 0; a < coords.length; a++) {
            coords[a][0] = Math.round(parseFloat(coords[a][0]) * 1000000) / 1000000;
            coords[a][1] = Math.round(parseFloat(coords[a][1]) * 1000000) / 1000000;
        }
        return coords;
    }

    function createNodes(coords) {
        var nds = [],
            nodes = [];

            // for polygons

        coords = roundCoords(coords);

        for (var a = 0; a < coords.length; a++) {
            nds.push({
              ref: count
            });

            //just do this here to avoid another loop
            var lat = Math.round(parseFloat(coords[a][0]) * 1000000) / 1000000;
            var lon = Math.round(parseFloat(coords[a][1]) * 1000000) / 1000000;

            if(coords[a].length != 2 || lat === undefined || !lon  === undefined){
              throw new Error('Bad/Missing Node Coords: ' + JSON.stringify(coords));
            }
            nodes.push({
              id: count,
              lat,
              lon,
              changeset
            });
            count--;
        }
        return {nds, nodes};
    }

    if (typeof geo === 'string') geo = JSON.parse(geo);

    var obj = {
        node: [],
        way: [],
        relation: []
    },
        count = -1;
    changeset = changeset || false;

    var startPos = 0;

    if(start){
      startPos = start;
    }

    switch (geo.type) {
        case 'FeatureCollection':

            var endPos = geo.features.length;

            if(limit){
              var offset = startPos + limit;
              if(offset < geo.features.length){
                endPos = offset;
              }
            }

            for (var i = startPos; i < endPos; i++){
                obj = append(toMacrocosmJSON(geo.features[i].geometry, geo.features[i].properties), obj);
            }

            break;

        case 'GeometryCollection':

            endPos = geo.geometries.length;

            if(limit){
              offset = startPos + limit;
              if(offset < geo.geometries.length){
                endPos = offset;
              }
            }

            for (var j = startPos; j < endPos; j++){
                obj = append(toMacrocosmJSON(geo.geometries[j]), obj);
            }
            break;

        case 'Feature':
            obj = toMacrocosmJSON(geo.geometry, geo.properties);
            break;

        case 'Point':
        case 'MultiPoint':
        case 'LineString':
        case 'MultiLineString':
        case 'Polygon':
        case 'MultiPolygon':
            obj = toMacrocosmJSON(geo);
            break;

        default:
            log.error('Invalid GeoJSON object: GeoJSON object must be one of \"Point\", \"LineString\", ' +
                '\"Polygon\", \"MultiPolygon\", \"Feature\", \"FeatureCollection\" or \"GeometryCollection\".');
    }

    var result = {
      create: obj,
      modify: {
      },
      delete: {
      }
    };

    return result;
};
