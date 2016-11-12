var React = require('react');

var Map = require('../components/Map/Map');
var Legend = require('../components/Map/Legend');
var Header = require('../components/header');
var slug = require('slug');
var styles = require('../components/Map/styles');
var $ = require('jquery');
var _map = require('lodash.map');
var _find = require('lodash.find');
var ReactDisqusThread = require('react-disqus-thread');
var urlUtil = require('../services/url-util');
var TerraformerGL = require('../services/terraformerGL.js');
var GroupTag = require('../components/Groups/GroupTag');

var Licenses = require('../components/CreateLayer/licenses');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');
var LayerNotes = require('../components/CreateLayer/LayerNotes');
var HubEditButton = require('../components/Hub/HubEditButton');
var LayerNotesActions = require('../actions/LayerNotesActions');
var LayerNotesStore = require('../stores/LayerNotesStore');

var moment = require('moment-timezone');
var clipboard;
if(process.env.APP_ENV === 'browser'){
 clipboard = require('clipboard-js');
}

import {addLocaleData, IntlProvider, FormattedRelative, FormattedDate, FormattedTime} from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';

addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(it);

//var debug = require('../services/debug')('layerinfo');

var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;

var LayerInfo = React.createClass({

  mixins:[
    StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']}),
    StateMixin.connect(LayerNotesStore, {initWithProps: ['notes']})
  ],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		layer: React.PropTypes.object.isRequired,
    notes: React.PropTypes.string,
    stats: React.PropTypes.object,
    canEdit: React.PropTypes.bool,
    createdByUser: React.PropTypes.object.isRequired,
    updatedByUser: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps(){
    return {
      stats: {maps: 0, stories: 0, hubs: 0},
      canEdit: false
    };
  },

  getInitialState(){
    return {
      geoJSON: null,
      dataMsg: '',
      gridHeight: 100,
      gridWidth: 100,
      gridHeightOffset: 48,
      editingNotes: false
    };
  },

  getGeoJSON(cb){
    var _this = this;
      var baseUrl, dataUrl, presetUrl;
    if(this.props.layer.remote){
      baseUrl = 'https://' + this.props.layer.remote_host;
      dataUrl = baseUrl + '/api/layer/'  + this.props.layer.remote_layer_id +'/export/json/data.geojson';
      presetUrl = baseUrl + '/api/layer/presets/' + _this.props.layer.remote_layer_id;
    }else{
      baseUrl = urlUtil.getBaseUrl();
      dataUrl =  baseUrl + '/api/layer/' + this.props.layer.layer_id +'/export/json/data.geojson';
      presetUrl = baseUrl + '/api/layer/presets/' + _this.props.layer.layer_id;
    }

    request.get(dataUrl)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        var geoJSON = res.body;
        request.get(presetUrl)
        .type('json').accept('json')
        .end(function(err, res){
          checkClientError(res, err, cb, function(cb){
            var presets = res.body;
            _this.processGeoJSON(geoJSON, presets);
              cb();
          });
        });
        cb();
      });
    });
  },

  processGeoJSON(geoJSON, presets=null){
    var _this = this;
    var originalRows = _map(geoJSON.features, 'properties');

    var firstRow = originalRows[0];

    var rowKey = 'osm_id';
    if(firstRow.osm_id){
      rowKey = 'osm_id';
    }
    else if(firstRow.objectid){
      rowKey = 'objectid';

    } else if(firstRow.OBJECTID){
      rowKey = 'OBJECTID';
    }

    var columns = [];
    columns.push(
      {
        key: rowKey,
        name: 'ID',
        width : 120,
        resizable: true,
        sortable : true,
        filterable: true
      }
    );
    if(presets){
      Object.keys(presets.fields).forEach(function(fieldsKey){
        var field = presets.fields[fieldsKey];

        columns.push(
          {
            key: field.key,
            name: field.label,
            width : 120,
            resizable: true,
            sortable : true,
            filterable: true
          }
        );
      });
    }else{
      Object.keys(firstRow).forEach(function(key){
        columns.push(
          {
            key,
            name: key,
            width : 120,
            resizable: true,
            sortable : true,
            filterable: true
          }
        );
      });
    }

    var rows = originalRows.slice(0);

    _this.setState({geoJSON, originalRows, columns, rowKey, rows, filters : {}});
  },


  componentDidMount(){
    var _this = this;
    $('ul.tabs').tabs();
    $('.layer-info-tooltip').tooltip();

    if(this.props.layer.is_external){
      //retreive geoJSON data for layers
      if(this.props.layer.external_layer_config.type === 'ags-mapserver-query'){
        TerraformerGL.getArcGISGeoJSON(this.props.layer.external_layer_config.url)
        .then(function(geoJSON){
          _this.processGeoJSON(geoJSON);
        });
          _this.setState({dataMsg: _this.__('Data Loading')});
      }else if(this.props.layer.external_layer_config.type === 'ags-featureserver-query'){
        TerraformerGL.getArcGISFeatureServiceGeoJSON(this.props.layer.external_layer_config.url)
        .then(function(geoJSON){
          _this.processGeoJSON(geoJSON);
        });
          _this.setState({dataMsg: _this.__('Data Loading')});
      }else{
        _this.setState({dataMsg: _this.__('Data table not support for this layer.')});
      }

    }else{
      this.getGeoJSON(function(){});
      _this.setState({dataMsg: _this.__('Data Loading')});
    }

    window.onbeforeunload = function(){
      if(_this.state.editingNotes){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  },

  componentDidUpdate(){

    if(!this.state.userResize){
      var evt = document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }

  },

  onTabSelect(){
    var _this = this;

    var gridHeight = $(this.refs.dataTabContent).height() - _this.state.gridHeightOffset;
    this.setState({gridHeight});

   $(window).resize(function(){
      var gridHeight = $(_this.refs.dataTabContent).height() - _this.state.gridHeightOffset;
      _this.setState({gridHeight, userResize: true});
    });

  },

  onToggleFilter(){
    //var _this = this;
    //var gridHeight = $(this.refs.dataTabContent).height() - _this.state.gridHeightOffset - 45;
    //this.setState({gridHeight, userResize: false});
  },

  //Build iD edit link
  getEditLink(){
    //get map position
    var position = this.refs.map.getPosition();
    var zoom = Math.ceil(position.zoom);
    if(zoom < 10) zoom = 10;
    var baseUrl = urlUtil.getBaseUrl();
    return baseUrl + '/edit#background=Bing&layer_id=' + this.props.layer.layer_id + '&map=' + zoom + '/' + position.lng + '/' + position.lat;
  },

  openEditor(){
    var editLink = this.getEditLink();
    window.location = editLink;
  },

  onRowSelect(rows){
    var _this = this;
    if(!rows || rows.length == 0){
      return;
    }
    var row = rows[0];
    var idField = this.state.rowKey;
    var idVal = row[idField];

    if(this.state.geoJSON){
      this.state.geoJSON.features.forEach(function(feature){
        if(idVal === feature.properties[idField]){
          var bbox = require('@turf/bbox')(feature);
          _this.refs.map.fitBounds(bbox, 16, 25);
          return;
        }
      });
    }
    this.setState({selectedRows: rows});
  },

  onViewSelectedFeature(){
    if(!this.state.selectedRows || this.state.selectedRows.length == 0){
      return;
    }
    var row = this.state.selectedRows[0];
    var idField = this.state.rowKey;
    var idVal = row[idField];

    var featureName = 'unknown';
    var nameFields = ['name', 'Name', 'NAME', 'nom', 'Nom', 'NOM', 'nombre', 'Nombre', 'NOMBRE'];
    nameFields.forEach(function(name){
      if(featureName == 'unknown' && row[name]){
        featureName = row[name];
      }
    });
    var url = '/feature/' + this.props.layer.layer_id + '/' + idVal + '/' + featureName;
    window.location = url;
  },

  rowGetter(rowIdx){
    return this.state.rows[rowIdx];
  },

  handleGridSort(sortColumn, sortDirection){

    var comparer = function(a, b) {
      if(sortDirection === 'ASC'){
        return (a[sortColumn] > b[sortColumn]) ? 1 : -1;
      }else if(sortDirection === 'DESC'){
        return (a[sortColumn] < b[sortColumn]) ? 1 : -1;
      }
    };

    var rows;

    if (sortDirection === 'NONE') {
      var originalRows = this.state.originalRows;
      rows = this.filterRows(originalRows, this.state.filters);
    } else {
      rows = this.state.rows.sort(comparer);
    }

    this.setState({rows});
  },

  filterRows(originalRows, filters) {
    var rows = originalRows.filter(function(r){
      var include = true;
      for (var columnKey in filters) {
        if(filters.hasOwnProperty(columnKey)) {
          var rowValue = null;
          if(r[columnKey]){
            rowValue = r[columnKey].toString().toLowerCase();
            if(rowValue.indexOf(filters[columnKey].toLowerCase()) === -1) {
              include = false;
            }
          }
        }
      }
      return include;
    });
    return rows;
  },

  handleFilterChange(filter){
    this.setState(function(currentState) {
      if (filter.filterTerm) {
        currentState.filters[filter.columnKey] = filter.filterTerm;
      } else {
        delete currentState.filters[filter.columnKey];
      }
      currentState.rows = this.filterRows(currentState.originalRows, currentState.filters);
      return currentState;
    });
  },

  handleNewComment(){

  },

  startEditingNotes(){
    this.setState({editingNotes: true});
  },

  stopEditingNotes(){
    var _this = this;

    LayerNotesActions.saveNotes(this.props.layer.layer_id, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Notes Saved')});
        _this.setState({editingNotes: false});
      }
    });

  },

  copyToClipboard(val){
    clipboard.copy(val);
  },

	render() {
    var _this = this;
    var glStyle = this.props.layer.style ? this.props.layer.style : styles[this.props.layer.data_type];

    var dataTabContent = '';
    if(this.state.originalRows && typeof window !== 'undefined'){
      var ReactDataGrid = require('react-data-grid');
      var ReactDataGridAddons = require('react-data-grid/addons');
      var Toolbar = require('../components/DataGrid/Toolbar');

       dataTabContent = (
         <ReactDataGrid
           ref="grid"
           columns={this.state.columns}
           rowKey={this.state.rowKey}
            rowGetter={this.rowGetter}
            rowsCount={this.state.rows.length}
            minHeight={this.state.gridHeight}
            onGridSort={this.handleGridSort}
            enableRowSelect="single"
            onRowSelect={this.onRowSelect}
            toolbar={<Toolbar
              enableFilter={true}
              filterButtonText={this.__('Filter Data')}
              onToggleFilterCallback={_this.onToggleFilter}
              viewFeatureButtonText={this.__('View Selected Feature')}
              onViewFeatureCallback={_this.onViewSelectedFeature}
              />
            }
            onAddFilter={this.handleFilterChange}
            />
       );

    }else {
      dataTabContent = (
        <div><h5>{this.state.dataMsg}</h5></div>
      );
    }

    var mapContent = '';
    var exportTabContent = '';

    if(this.props.layer.is_external){
      mapContent = (
        <Map ref="map" className="map-absolute map-with-header width-50"
          fitBounds={this.props.layer.preview_position.bbox}
          glStyle={glStyle}>
          <Legend style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              zIndex: '1',
              width: '25%',
              maxWidth: '325px',
              maxHeight: 'calc(100% - 200px)',
              display: 'flex',
              flexDirection: 'column'
            }}
            collapsible={true}
            title={this.props.layer.name}
              layers={[this.props.layer]}/>
        </Map>
      );
      exportTabContent = (
        <div>
          <p>{this.__('This is an external data layer. For exports please see the data source at:')} {this.props.layer.source}</p>
        </div>
      );
    }else {
      mapContent = (
        <Map ref="map" className="map-absolute map-with-header width-50"
          fitBounds={this.props.layer.preview_position.bbox}
          glStyle={glStyle} >
          <Legend style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              minWidth: '275px',
              zIndex: '1',
              width: '25%',
              maxWidth: '325px',
              maxHeight: 'calc(100% - 200px)',
              display: 'flex',
              flexDirection: 'column'
            }}
            collapsible={true}
            title={this.props.layer.name}
              layers={[this.props.layer]}/>
        </Map>
      );
      var geoJSONURL = '/api/layer/' + this.props.layer.layer_id + '/export/json/' + slug(this.props.layer.name) + '.geojson';
      var shpURL = '/api/layer/' + this.props.layer.layer_id + '/export/shp/' + slug(this.props.layer.name) + '.zip';
      var kmlURL = '/api/layer/' + this.props.layer.layer_id + '/export/kml/' + slug(this.props.layer.name) + '.kml';
      var csvURL = '/api/layer/' + this.props.layer.layer_id + '/export/csv/' + slug(this.props.layer.name) + '.csv';
      var gpxURL = '/api/layer/' + this.props.layer.layer_id + '/export/gpx/' + slug(this.props.layer.name) + '.gpx';

      var bounds = '';
      if(this.props.layer.extent_bbox){
        bounds = this.props.layer.extent_bbox.toString();
      }
      var osmURL = '/xml/map/'  + this.props.layer.layer_id + '?bbox=' + bounds;

      //http://dev.localhost:4000/xml/map/44?bbox=
      if(!this.props.layer.disable_export){
        var gpxExport = '';
        if(this.props.layer.data_type !== 'polygon'){
          gpxExport = (
            <li className="collection-item">{this.__('GPX:')} <a href={gpxURL}>{gpxURL}</a></li>
          );
        }
        exportTabContent = (
          <div>
            <ul className="collection with-header">
             <li className="collection-header"><h5>{this.__('Export Data')}</h5></li>
             <li className="collection-item">{this.__('Shapefile:')} <a href={shpURL}>{shpURL}</a></li>
             <li className="collection-item">{this.__('GeoJSON:')} <a href={geoJSONURL}>{geoJSONURL}</a></li>
             <li className="collection-item">{this.__('KML:')} <a href={kmlURL}>{kmlURL}</a></li>
             <li className="collection-item">{this.__('CSV:')} <a href={csvURL}>{csvURL}</a></li>
             {gpxExport}
            </ul>
           <ul className="collection with-header">
            <li className="collection-header"><h5>{this.__('Services')}</h5></li>
            <li className="collection-item">{this.__('Feature Service (ArcGIS compatible):')} Coming Soon</li>
            <li className="collection-item">{this.__('API (OpenStreetMap compatible):')} <a href={osmURL}>{osmURL}/</a></li>
           </ul>
          </div>
        );
      }else{
        exportTabContent = (
          <div>
            <p>{this.__('Export is not available for this layer.')}</p>
          </div>
        );
      }
    }

    var tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

    var editButton = '', notesEditButton;

    if(this.props.canEdit){
      notesEditButton = (
        <HubEditButton editing={this.state.editingNotes}
          style={{position: 'absolute'}}
          startEditing={this.startEditingNotes} stopEditing={this.stopEditingNotes} />
      );

      var idEditButton = '', addPhotoPointButton = '';
      if(!this.props.layer.is_external){
        idEditButton = (
          <li>
            <a onClick={this.openEditor} className="btn-floating layer-info-tooltip blue darken-1" data-delay="50" data-position="left" data-tooltip={this.__('Edit Map Data')}>
              <i className="material-icons">mode_edit</i>
            </a>
          </li>
        );
        if(this.props.layer.data_type == "point"){
          addPhotoPointButton = (
            <li>
              <a href={'/layer/adddata/' + this.props.layer.layer_id } className="btn-floating layer-info-tooltip blue darken-1" data-delay="50" data-position="left" data-tooltip={this.__('Add a Photo')}>
                <i className="material-icons">photo</i>
              </a>
            </li>
          );
        }
      }
      editButton = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red red-text">
            <i className="large material-icons">more_vert</i>
          </a>
          <ul>
            <li>
              <a className="btn-floating layer-info-tooltip red" data-delay="50" data-position="left" data-tooltip={this.__('View Full Screen Map')}
                  href={'/layer/map/' + this.props.layer.layer_id + '/' + slug(this.props.layer.name)}>
                <i className="material-icons">map</i>
              </a>
            </li>
            {idEditButton}
            {addPhotoPointButton}
            <li>
              <a className="btn-floating layer-info-tooltip yellow" href={'/layer/admin/' + this.props.layer.layer_id + '/' + slug(this.props.layer.name)}data-delay="50" data-position="left" data-tooltip={this.__('Manage Layer')}>
                <i className="material-icons">settings</i>
              </a>
            </li>
          </ul>
        </div>
      );
    }else {
      editButton = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large layer-info-tooltip red" data-delay="50" data-position="left" data-tooltip={this.__('View Full Screen Map')}
              href={'/layer/map/' + this.props.layer.layer_id + '/' + slug(this.props.layer.name)}>
            <i className="material-icons">map</i>
          </a>
        </div>
      );
    }

    var guessedTz = moment.tz.guess();
    var creationTimeObj = moment.tz(this.props.layer.creation_time, guessedTz);
    var creationTime = creationTimeObj.format();
    var updatedTimeObj = moment.tz(this.props.layer.last_updated, guessedTz);
    var updatedTimeStr = updatedTimeObj.format();
    var updatedTime = '';
    if(updatedTimeObj > creationTimeObj){
      updatedTime = (
        <p style={{fontSize: '16px'}}><b>{this.__('Last Update:')} </b>
          <IntlProvider locale={this.state.locale}>
            <FormattedDate value={updatedTimeStr}/>
          </IntlProvider>&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedTime value={updatedTimeStr}/>
          </IntlProvider>&nbsp;
          (<IntlProvider locale={this.state.locale}>
            <FormattedRelative value={updatedTimeStr}/>
          </IntlProvider>)&nbsp;
            {this.__('by') + ' ' + this.props.updatedByUser.display_name}
          </p>
      );
    }





    var licenseOptions = Licenses.getLicenses(this.__);
    var license = _find(licenseOptions, {value: this.props.layer.license});

    var descriptionWithLinks = '';

    if(this.props.layer.description){
      // regex for detecting links
      var regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig;
      descriptionWithLinks = this.props.layer.description.replace(regex, "<a href='$1' target='_blank'>$1</a>");
    }

    var remote = '';
    if(this.props.layer.remote){
      var remoteURL = 'https://' + this.props.layer.remote_host + '/layer/info/' + this.props.layer.remote_layer_id + '/' + slug(this.props.layer.name);
      remote = (
        <p style={{fontSize: '16px'}}><b>{this.__('Remote Layer from: ')} </b>
          <a href={remoteURL} target="_blank">{remoteURL}</a>
        </p>
      );
    }

    var external = '';
    if(this.props.layer.is_external && !this.props.layer.remote){
      var externalUrl = this.props.layer.external_layer_config.url;
      var type = '';
      if(this.props.layer.external_layer_type == 'openstreetmap'){
        type = 'OpenStreetMap';
        externalUrl = 'http://openstreetmap.org';
      }else if(this.props.layer.external_layer_config.type == 'raster'){
        type = 'Raster';
        externalUrl = this.props.layer.external_layer_config.tiles[0];
      }else if((!this.props.layer.external_layer_type || this.props.layer.external_layer_type == '')
              && this.props.layer.external_layer_config.type){
        type = this.props.layer.external_layer_config.type;
      }else{
        type = this.props.layer.external_layer_type;
      }
      external = (
        <div>
          <p style={{fontSize: '16px'}}><b>{this.__('External Layer: ')}</b>{type}
            &nbsp;-&nbsp;
            <a href={externalUrl} target="_blank">{externalUrl}</a>
            <i className="material-icons layer-info-tooltip omh-accent-text" style={{cursor: 'pointer'}} data-delay="50" onClick={function(){_this.copyToClipboard(externalUrl);}} data-position="left" data-tooltip={this.__('Copy to Clipboard')}>launch</i>
          </p>
        </div>
      );
    }

    var disqus = '';
    if(!MAPHUBS_CONFIG.mapHubsPro){
      disqus = (
        <ReactDisqusThread
              shortname="maphubs"
              identifier={'maphubs-layer-' + this.props.layer.layer_id}
              title={this.props.layer.name}
              onNewComment={this.handleNewComment}
              />
          );
    }else{
      disqus = (
        <div>
          <h5>Disabled</h5>
          <p>{MAPHUBS_CONFIG.productName + this.__(' uses a public cloud-based commenting system, it is disabled on private layers for security reasons. The notes section can be used for secure collaboration.')}</p>
        </div>
      );
    }

		return (

      <div>
        <Header />
        <main style={{height: 'calc(100% - 51px)', marginTop: 0}}>
        <div className="row" style={{height: '100%', margin: 0}}>
          <div className="col s12 m6 l6 no-padding" style={{height: '100%'}}>
            <div style={{margin: '10px'}}>
              <h5>{this.props.layer.name}</h5>
            </div>


            <div className="row no-margin" style={{height: 'calc(100% - 50px)'}}>
              <ul className="tabs" style={{overflowX: 'auto'}}>
                <li className="tab"><a className="active" href="#info">{this.__('Info')}</a></li>
                <li className="tab"><a href="#notes">{this.__('Notes')}</a></li>
                <li className="tab"><a href="#discuss">{this.__('Discuss')}</a></li>
                <li className="tab"><a href="#data" onClick={this.onTabSelect}>{this.__('Data')}</a></li>
                <li className="tab"><a href="#export">{this.__('Export')}</a></li>
              </ul>
              <div id="info" className="col s12 no-padding" style={{height: 'calc(100% - 47px)', display: tabContentDisplay, position: 'relative'}}>
                <div className="row" style={{height: 'calc(100% - 75px)', marginLeft:'10px', marginRight: '10px', overflowY: 'auto', overflowX: 'hidden', wordWrap: 'break-word'}}>
                  <div className="right">
                    <GroupTag group={this.props.layer.owned_by_group_id} size={25} fontSize={12} />
                  </div>
                  {remote}
                  {external}
                  <p style={{fontSize: '16px'}}><b>{this.__('Created:')} </b>
                  <IntlProvider locale={this.state.locale}>
                    <FormattedDate value={creationTime}/>
                  </IntlProvider>&nbsp;
                  <IntlProvider locale={this.state.locale}>
                    <FormattedTime value={creationTime}/>
                  </IntlProvider>&nbsp;
                  (<IntlProvider locale={this.state.locale}>
                    <FormattedRelative value={creationTime}/>
                  </IntlProvider>)&nbsp;
                    {this.__('by') + ' ' + this.props.updatedByUser.display_name}
                    </p>
                {updatedTime}
                <p style={{fontSize: '16px', maxHeight: '55px', overflow: 'auto'}}><b>{this.__('Data Source:')}</b> {this.props.layer.source}</p>
                <p style={{fontSize: '16px'}}><b>{this.__('License:')}</b> {license.label}</p><div dangerouslySetInnerHTML={{__html: license.note}}></div>
                <p style={{fontSize: '16px', wordWrap: 'break-word', maxHeight: '95px', overflow: 'auto'}}><b>{this.__('Description:')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}}></div>

                </div>

                <div className="row no-margin" style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF'}}>
                  <div className="col s6 m3 l3 center-align">
                    <b className="center-align">{this.__('Views')}</b>
                    <p className="center-align">{this.props.layer.views}</p>
                  </div>
                  <div className="col s6 m3 l3 center-align">
                    <b className="center-align">{this.__('Maps')}</b>
                    <p className="center-align">{this.props.stats.maps}</p>
                  </div>
                  <div className="col s6 m3 l3 center-align">
                    <b className="center-align">{this.__('Stories')}</b>
                    <p className="center-align">{this.props.stats.stories}</p>
                  </div>
                  <div className="col s6 m3 l3 center-align">
                    <b className="center-align">{this.__('Hubs')}</b>
                    <p className="center-align">{this.props.stats.hubs}</p>
                  </div>
                </div>
              </div>
              <div id="notes" className="col s12" style={{height: 'calc(100% - 47px)', display: tabContentDisplay, position: 'relative'}}>
                <LayerNotes editing={this.state.editingNotes}/>
                {notesEditButton}
              </div>
              <div id="discuss" className="col s12" style={{display: tabContentDisplay}}>
                {disqus}
              </div>
              <div id="data" ref="dataTabContent" className="col s12 no-padding" style={{height: 'calc(100% - 47px)', display: tabContentDisplay}}>
                <div className="row no-margin">
                  {dataTabContent}
                </div>


              </div>
              <div id="export" className="col s12" style={{display: tabContentDisplay}}>
                {exportTabContent}
              </div>
            </div>

          </div>
            <div className="col hide-on-small-only m6 l6 no-padding">
              {mapContent}
            </div>
          </div>
          {editButton}
        </main>
			</div>

		);
	}
});

module.exports = LayerInfo;
