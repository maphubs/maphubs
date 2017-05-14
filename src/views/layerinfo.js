//@flow
import React from 'react';
import Map from '../components/Map/Map';
import MiniLegend from '../components/Map/MiniLegend';
import Header from '../components/header';
import _find from 'lodash.find';
import ReactDisqusThread from 'react-disqus-thread';
import TerraformerGL from '../services/terraformerGL.js';
import GroupTag from '../components/Groups/GroupTag';
import Licenses from '../components/CreateLayer/licenses';
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import LayerNotes from '../components/CreateLayer/LayerNotes';
import HubEditButton from '../components/Hub/HubEditButton';
import LayerNotesActions from '../actions/LayerNotesActions';
import LayerNotesStore from '../stores/LayerNotesStore';
import LayerDataGrid from '../components/DataGrid/LayerDataGrid';
var urlUtil = require('../services/url-util');
var slug = require('slug');
var styles = require('../components/Map/styles');
var $ = require('jquery');
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
import request from 'superagent';
var checkClientError = require('../services/client-error-response').checkClientError;
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import fireResizeEvent from '../services/fire-resize-event';
import LocaleStore from '../stores/LocaleStore';
import type {LocaleStoreState} from '../stores/LocaleStore';


type Props = {
  layer: Object,
  notes: string,
  stats: Object,
  canEdit: boolean,
  createdByUser: Object,
  updatedByUser: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object
}

type LayerInfoState = {
  editingNotes: boolean,
  gridHeight: number,
  gridHeightOffset: number,
  userResize?: boolean,
  geoJSON?: Object,
  presets?: Object
}

type State = LocaleStoreState & LayerInfoState

export default class LayerInfo extends MapHubsComponent<void, Props, State> {

  props: Props

  static defaultProps = {
      stats: {maps: 0, stories: 0, hubs: 0},
      canEdit: false
  }

  state: State = {
    editingNotes: false,
    gridHeight: 100,
    gridHeightOffset: 48
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerNotesStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(LayerNotesStore, {notes: this.props.notes});
  }

  componentDidMount(){
    var _this = this;
    $('ul.tabs').tabs();
    $('.layer-info-tooltip').tooltip();

    if(this.props.layer.is_external){
      //retreive geoJSON data for layers
      if(this.props.layer.external_layer_config.type === 'ags-mapserver-query'){
        TerraformerGL.getArcGISGeoJSON(this.props.layer.external_layer_config.url)
        .then((geoJSON) => {
          _this.setState({geoJSON});
        });
          _this.setState({dataMsg: _this.__('Data Loading')});
      }else if(this.props.layer.external_layer_config.type === 'ags-featureserver-query'){
        TerraformerGL.getArcGISFeatureServiceGeoJSON(this.props.layer.external_layer_config.url)
        .then((geoJSON) => {
          _this.setState({geoJSON});
        });
          _this.setState({dataMsg: _this.__('Data Loading')});
      }else if(this.props.layer.external_layer_config.type === 'geojson'){
          request.get(this.props.layer.external_layer_config.data)
          .type('json').accept('json')
          .end((err, res) => {
            var geoJSON = res.body;
            _this.setState({geoJSON});
          });
         _this.setState({dataMsg: _this.__('Data Loading')});
      }else{
        _this.setState({dataMsg: _this.__('Data table not support for this layer.')});
      }

    }else{
      this.getGeoJSON(() => {});
      _this.setState({dataMsg: _this.__('Data Loading')});
    }

    window.onbeforeunload = function(){
      if(_this.state.editingNotes){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  }

  componentDidUpdate(){
    if(!this.state.userResize){
      fireResizeEvent();
    }
  }

  getGeoJSON = (cb: Function) => {
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
    .end((err, res) => {
      checkClientError(res, err, cb, (cb) => {
        var geoJSON = res.body;
        request.get(presetUrl)
        .type('json').accept('json')
        .end((err, res) => {
          checkClientError(res, err, cb, (cb) => {
            var presets = res.body;
            _this.setState({geoJSON, presets});
            cb();
          });
        });
        cb();
      });
    });
  }

  onTabSelect = () => {
    var _this = this;

    var gridHeight = $(this.refs.dataTabContent).height() - _this.state.gridHeightOffset;
    this.setState({gridHeight});

   $(window).resize(() => {
      var gridHeight = $(_this.refs.dataTabContent).height() - _this.state.gridHeightOffset;
      _this.setState({gridHeight, userResize: true});
    });

  }

  onRowSelected = (idVal: string, idField: string) => {
    var _this = this;
    if(this.state.geoJSON){
      this.state.geoJSON.features.forEach((feature) => {
        if(idVal === feature.properties[idField]){
          var bbox = require('@turf/bbox')(feature);
          _this.refs.map.fitBounds(bbox, 16, 25);
          return;
        }
      });
    }
  }

  //Build iD edit link
  getEditLink = () => {
    //get map position
    var position = this.refs.map.getPosition();
    var zoom = Math.ceil(position.zoom);
    if(zoom < 10) zoom = 10;
    var baseUrl = urlUtil.getBaseUrl();
    return baseUrl + '/map/new?editlayer=' + this.props.layer.layer_id + '#' + zoom + '/' + position.lng + '/' + position.lat;
  }

  openEditor = () => {
    var editLink = this.getEditLink();
    window.location = editLink;
  }

  handleNewComment = () => {

  }

  startEditingNotes = () => {
    this.setState({editingNotes: true});
  }

  stopEditingNotes = () => {
    var _this = this;

    LayerNotesActions.saveNotes(this.props.layer.layer_id, this.state._csrf, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Notes Saved')});
        _this.setState({editingNotes: false});
      }
    });
  }

  copyToClipboard = (val: string) => {
    clipboard.copy(val);
  }

	render() {
    var _this = this;
    var glStyle = this.props.layer.style ? this.props.layer.style : styles[this.props.layer.data_type];

    var exportTabContent = '';

    if(this.props.layer.is_external){
      exportTabContent = (
        <div>
          <p>{this.__('This is an external data layer. For exports please see the data source at:')} {this.props.layer.source}</p>
        </div>
      );
    }else {
      var geoJSONURL = '/api/layer/' + this.props.layer.layer_id + '/export/json/' + slug(this.props.layer.name) + '.geojson';
      var shpURL = '/api/layer/' + this.props.layer.layer_id + '/export/shp/' + slug(this.props.layer.name) + '.zip';
      var kmlURL = '/api/layer/' + this.props.layer.layer_id + '/export/kml/' + slug(this.props.layer.name) + '.kml';
      var csvURL = '/api/layer/' + this.props.layer.layer_id + '/export/csv/' + slug(this.props.layer.name) + '.csv';
      var gpxURL = '/api/layer/' + this.props.layer.layer_id + '/export/gpx/' + slug(this.props.layer.name) + '.gpx';

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
        if(this.props.layer.data_type === "point"){
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
      descriptionWithLinks = this.props.layer.description.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>");
    }

    var remote = '';
    if(this.props.layer.remote){
      var remoteURL = 'https://' + this.props.layer.remote_host + '/layer/info/' + this.props.layer.remote_layer_id + '/' + slug(this.props.layer.name);
      remote = (
        <p style={{fontSize: '16px'}}><b>{this.__('Remote Layer from: ')} </b>
          <a href={remoteURL} target="_blank" rel="noopener noreferrer">{remoteURL}</a>
        </p>
      );
    }

    var external = '';
    if(this.props.layer.is_external && !this.props.layer.remote){
      var externalUrl = this.props.layer.external_layer_config.url;
      var type = '';
      if(this.props.layer.external_layer_type === 'openstreetmap'){
        type = 'OpenStreetMap';
        externalUrl = 'http://openstreetmap.org';
      }else if(this.props.layer.external_layer_config.type === 'raster'){
        type = 'Raster';
        externalUrl = this.props.layer.external_layer_config.tiles[0];
      }else if((!this.props.layer.external_layer_type || this.props.layer.external_layer_type === '')
              && this.props.layer.external_layer_config.type){
        type = this.props.layer.external_layer_config.type;
      }else if(this.props.layer.external_layer_config.type === 'geojson'){
        type = 'GeoJSON';
        externalUrl = this.props.layer.external_layer_config.data;
      }else{
        type = this.props.layer.external_layer_type;
      }
      external = (
        <div>
          <p style={{fontSize: '16px'}}><b>{this.__('External Layer: ')}</b>{type}
            &nbsp;-&nbsp;
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">{externalUrl}</a>
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

    var privateIcon = '';
    if(this.props.layer.private){
      privateIcon = (
        <div style={{position: 'absolute', top: '15px', right: '10px'}}>
        <i className="material-icons grey-text text-darken-3 layer-info-tooltip"
        data-position="left" data-delay="50" data-tooltip={this.__('Private')}>
        lock</i>
        </div>
      );
    }

		return (

      <div>
        <Header {...this.props.headerConfig}/>
        <main style={{height: 'calc(100% - 51px)', marginTop: 0}}>
        <div className="row" style={{height: '100%', margin: 0}}>
          <div className="col s12 m6 l6 no-padding" style={{height: '100%', position: 'relative'}}>
          {privateIcon}
            <div style={{margin: '10px', height: '50px'}}>
              <h5 className="word-wrap">{this.props.layer.name}</h5>
            </div>

            <div className="row no-margin" style={{height: 'calc(100% - 72px)'}}>
              <ul className="tabs" style={{overflowX: 'auto'}}>
                <li className="tab"><a className="active" href="#info">{this.__('Info')}</a></li>
                <li className="tab"><a href="#notes">{this.__('Notes')}</a></li>
                <li className="tab"><a href="#discuss">{this.__('Discuss')}</a></li>
                <li className="tab"><a href="#data" onClick={this.onTabSelect}>{this.__('Data')}</a></li>
                <li className="tab"><a href="#export">{this.__('Export')}</a></li>
              </ul>
              <div id="info" className="col s12 no-padding" style={{height: 'calc(100% - 47px)', display: tabContentDisplay, position: 'relative'}}>
                <div className="row word-wrap" style={{height: 'calc(100% - 75px)', marginLeft:'10px', marginRight: '10px', overflowY: 'auto', overflowX: 'hidden'}}>
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
                <p className="word-wrap" style={{fontSize: '16px', maxHeight: '95px', overflow: 'auto'}}><b>{this.__('Description:')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}}></div>

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
                  <LayerDataGrid  layer_id={this.props.layer.layer_id} gridHeight={this.state.gridHeight} geoJSON={this.state.geoJSON} presets={this.state.presets} onRowSelected={this.onRowSelected} />
                </div>
              </div>
              <div id="export" className="col s12" style={{display: tabContentDisplay}}>
                {exportTabContent}
              </div>
            </div>

          </div>
            <div className="col hide-on-small-only m6 l6 no-padding">
              <Map ref="map" className="map-absolute map-with-header width-50"
                fitBounds={this.props.layer.preview_position.bbox}
                glStyle={glStyle}>
                <MiniLegend style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    minWidth: '275px',
                    width: '25%',
                    maxWidth: '325px',
                    maxHeight: 'calc(100% - 200px)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  collapsible={true} hideInactive={false} showLayersButton={false}
                    layers={[this.props.layer]}/>
                <div className="addthis_sharing_toolbox" style={{position: 'absolute', bottom: '0px', left: '155px', zIndex:'1'}}></div>       
              </Map>
            </div>
          </div>
          {editButton}
        </main>
			</div>

		);
	}
}