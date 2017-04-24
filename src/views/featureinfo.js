//@flow
import React from 'react';
import Map from '../components/Map/Map';
import Header from '../components/header';
var slug = require('slug');
var urlUtil = require('../services/url-util');
//var styles = require('../components/Map/styles');
var $ = require('jquery');
import ReactDisqusThread from 'react-disqus-thread';
var Griddle = require('griddle-react');

import FeatureNotes from '../components/Feature/FeatureNotes';
import HubEditButton from '../components/Hub/HubEditButton';
import ImageCrop from '../components/ImageCrop';
//var request = require('superagent');

import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import ConfirmationActions from '../actions/ConfirmationActions';

import FeatureNotesActions from '../actions/FeatureNotesActions';
import FeaturePhotoActions from '../actions/FeaturePhotoActions';
import FeatureNotesStore from '../stores/FeatureNotesStore';
import FeaturePhotoStore from '../stores/FeaturePhotoStore';
var turf_area = require('@turf/area');
import {addLocaleData, IntlProvider, FormattedNumber} from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(it);
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class FeatureInfo extends MapHubsComponent {

  props: {
    feature: Object,
    notes: string,
    photo: Object,
    layer: Object,
    canEdit: boolean,
    locale: string,
    _csrf: string
  }

  state = {
    editingNotes: false
  }

  constructor(props: Object){
		super(props);
    this.stores.push(FeatureNotesStore);
    this.stores.push(FeaturePhotoStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(FeatureNotesStore, {notes: this.props.notes});
    Reflux.rehydrate(FeaturePhotoStore, {feature: this.props.feature, photo: this.props.photo});
	}

  componentDidMount(){
    $('ul.tabs').tabs();
    var _this = this;
    window.onbeforeunload = function(){
      if(_this.state.editingNotes){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  }

  startEditingNotes = () =>{
    this.setState({editingNotes: true});
  }

  stopEditingNotes = () => {
    var _this = this;
    var geoJSONProps = this.props.feature.geojson.features[0].properties;

    FeatureNotesActions.saveNotes(this.props.layer.layer_id, geoJSONProps.mhid, this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Notes Saved')});
        _this.setState({editingNotes: false});
      }
    });
  }

  showImageCrop = () => {
    this.refs.imagecrop.show();
  }

  onCrop = (data: Object, info: Object) => {
    var _this = this;
    //send data to server
    FeaturePhotoActions.addPhoto(data, info, this.state._csrf, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification(
          {
            message: _this.__('Image Saved'),
            position: 'bottomright',
            dismissAfter: 3000,
            onDismiss(){
              location.reload();
            }
        });
      }
    });
  }

  deletePhoto = () => {
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Removal'),
      message: _this.__('Are you sure you want to remove this photo?'),
      onPositiveResponse(){
        FeaturePhotoActions.removePhoto(this.state._csrf, function(err){
          if(err){
            MessageActions.showMessage({title: _this.__('Server Error'), message: err});
          }else{
            NotificationActions.showNotification(
              {
                message: _this.__('Image Removed'),
                position: 'bottomright',
                dismissAfter: 3000
            });
          }
        });
      }
    });
  }

  //Build iD edit link
  getEditLink = () => {
    //get map position
    var position = this.refs.map.getPosition();
    var zoom = Math.ceil(position.zoom);
    if(zoom < 10) zoom = 10;
    var baseUrl = urlUtil.getBaseUrl();
    return baseUrl + '/edit#background=Bing&layer_id=' + this.props.layer.layer_id + '&map=' + zoom + '/' + position.lng + '/' + position.lat;
  }

  openEditor = () => {
    var editLink = this.getEditLink();
    window.location = editLink;
  }

	render() {
    //var glStyle = null;
    var locationDisplay = '';

    var featureAreaDisplay = (
    <div className="row">
        <h5>{this.__('Area')}</h5>
        {this.__('Not available for this feature')}
      </div>
    );
    if(this.props.feature && this.props.layer && this.props.feature.geojson){
      //glStyle = this.props.layer.style ? this.props.layer.style : styles[this.props.feature.layer.data_type];

      var featureName: string = "Feature";
      var featureAreaM2, featureAreaKM2, featureAreaHA, areaDisplay;
      if(this.props.feature.geojson.features && this.props.feature.geojson.features.length > 0){
        var geoJSONProps = this.props.feature.geojson.features[0].properties;
        if(geoJSONProps.name) {
          featureName = geoJSONProps.name;
        }
        featureAreaM2 = turf_area(this.props.feature.geojson);
        if(featureAreaM2 && featureAreaM2 > 0){
          featureAreaKM2 = featureAreaM2 * 0.000001;
          featureAreaHA =featureAreaM2 / 10000.00;

          var hectaresDisplay = (
            <span>
              <IntlProvider locale={this.state.locale}>
                <FormattedNumber value={featureAreaHA}/>
              </IntlProvider>&nbsp;ha</span>
          );

          if(featureAreaKM2 < 1){
            areaDisplay = (
              <span>
                <IntlProvider locale={this.state.locale}>
                  <FormattedNumber value={featureAreaM2}/>
                </IntlProvider>&nbsp;m²</span>
            );
          }else{
            areaDisplay = (
                <span>
                  <IntlProvider locale={this.state.locale}>
                  <FormattedNumber value={featureAreaKM2}/>
                </IntlProvider>&nbsp;km²
              </span>
            );
          }

          featureAreaDisplay = (
          <div className="row">
              <h5>{this.__('Area')}</h5>
              {areaDisplay}
              <br/>
              {hectaresDisplay}
            </div>
          );
        }

        var centroid = require('@turf/centroid')(this.props.feature.geojson);

        var utm = require('wgs84-util').LLtoUTM(centroid.geometry);

        var lon = centroid.geometry.coordinates[0];
        var lat = centroid.geometry.coordinates[1];
        locationDisplay = (
          <div className="row">
            <h5>{this.__('Location')}</h5>
            <div className="row no-margin">
              <span>
                <b>{this.__('Latitude:')}</b>&nbsp;
                <IntlProvider locale={this.state.locale}>
                  <FormattedNumber value={lat}/>
                </IntlProvider>&nbsp;
              </span>
              <span>
                <b>{this.__('Longitude:')}</b>&nbsp;
                <IntlProvider locale={this.state.locale}>
                  <FormattedNumber value={lon}/>
                </IntlProvider>&nbsp;
              </span>
            </div>
            <div className="row no-margin">
              <span>
                <b>{this.__('UTM:')}</b>&nbsp;
                {utm.properties.zoneNumber}{utm.properties.zoneLetter}&nbsp;
                <IntlProvider locale={this.state.locale}>
                  <FormattedNumber value={utm.geometry.coordinates[0]}/>
                </IntlProvider>m E&nbsp;
                <IntlProvider locale={this.state.locale}>
                  <FormattedNumber value={utm.geometry.coordinates[1]}/>
                </IntlProvider>m N
                </span>
            </div>
          </div>
        );

      }

      var data = [];
      for (var key in geoJSONProps){
        data.push({tag: key, value: geoJSONProps[key]});
      }
    }

    var notesEditButton = '', photoEditButton = '';

    if(this.props.canEdit){
      notesEditButton = (
        <HubEditButton editing={this.state.editingNotes}
          style={{position: 'absolute'}}
          startEditing={this.startEditingNotes} stopEditing={this.stopEditingNotes} />
      );

      if(this.state.photo && this.state.photo.photo_id){
        photoEditButton = (
          <div className="row no-margin">
            <button className="btn" style={{marginLeft: '10px'}}
              onClick={this.showImageCrop}>{this.__('Replace Photo')}</button>
              <button className="btn" style={{marginLeft: '10px'}}
                onClick={this.deletePhoto}>{this.__('Remove Photo')}</button>
          </div>
        );

      }else{
        photoEditButton = (
          <div className="row no-margin">
            <button className="btn" style={{marginLeft: '10px'}}
              onClick={this.showImageCrop}>{this.__('Add Photo')}</button>
          </div>
        );
      }
    }

    var baseUrl = urlUtil.getBaseUrl();
    var photo = '';

    if(this.state.photo && this.state.photo.photo_id){
      var photoUrl = baseUrl + '/feature/photo/' + this.state.photo.photo_id + '.jpg';
      photo = (
          <img style={{width: 'auto', maxHeight:'calc(100% - 58px)', paddingTop: '10px'}} src={photoUrl} alt="feature photo attachment"/>
      );
    }else{
        photo = (
          <div style={{maxHeight:'calc(100% - 58px)', paddingTop: '10px'}}>
            <i className="material-icons grey-text valign" style={{fontSize: '72px', margin: '10px'}}>add_a_photo</i>
          </div>
        );
    }

    var editButton = '';
    if(this.props.canEdit){
      var idEditButton = '';
      if(!this.props.layer.is_external){
        idEditButton = (
          <li>
            <a onClick={this.openEditor} className="btn-floating layer-info-tooltip blue darken-1" data-delay="50" data-position="left" data-tooltip={this.__('Edit Map Data')}>
              <i className="material-icons">mode_edit</i>
            </a>
          </li>
        );
      }
      editButton = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red red-text">
            <i className="large material-icons">more_vert</i>
          </a>
          <ul>
            {idEditButton}
          </ul>
        </div>
      );
    }

    var layerUrl = baseUrl + '/layer/info/' + this.props.layer.layer_id + '/' + slug(this.props.layer.name);

    var exportTabContent = '';

    var mhid = this.props.feature.mhid.split(':')[1];

     var gpxLink; 
   
    if(this.props.layer.is_external){
      exportTabContent = (
        <div>
          <p>{this.__('This is an external data layer. For exports please see the data source at:')} {this.props.layer.source}</p>
        </div>
      );
    }else {
      var geoJSONURL = '/api/feature/json/' + this.props.layer.layer_id + '/' + mhid + '/' + slug(this.props.layer.name) + '.geojson';
      var kmlURL = '/api/feature/' + this.props.layer.layer_id + '/' + mhid + '/export/kml/' + slug(this.props.layer.name) + '.kml';
      
      if(!this.props.layer.disable_export){
        var gpxExport = '';
        if(this.props.layer.data_type === 'polygon'){
          gpxLink = baseUrl + '/api/feature/gpx/' +  this.props.layer.layer_id + '/' + mhid + '/feature.gpx';
          gpxExport = (
            <li className="collection-item">{this.__('GPX:')} <a href={gpxLink}>{gpxLink}</a></li>
          );
        }
        exportTabContent = (
          <div>
            <ul className="collection with-header">
             <li className="collection-header"><h5>{this.__('Export Data')}</h5></li>
             <li className="collection-item">{this.__('GeoJSON:')} <a href={geoJSONURL}>{geoJSONURL}</a></li>
             <li className="collection-item">{this.__('KML:')} <a href={kmlURL}>{kmlURL}</a></li>
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

    if(this.props.layer.data_type === 'polygon'){
      gpxLink = baseUrl + '/api/feature/gpx/' +  this.props.layer.layer_id + '/' + this.props.feature.mhid + '/feature.gpx';
    }
    return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 52px)', marginTop: '0px'}}>
        <div className="row" style={{height: '100%', margin: 0}}>
          <div className="col s6 no-padding" style={{height: '100%'}}>
            <div style={{margin: '10px'}}>
              <h4>{featureName}</h4>

            </div>

            <div className="row no-margin" style={{height: 'calc(100% - 67px)'}}>
              <ul className="tabs" style={{overflowX: 'hidden'}}>
                <li className="tab"><a className="active" href="#data">{this.__('Data')}</a></li>
                <li className="tab"><a href="#photo">{this.__('Photo')}</a></li>
                <li className="tab"><a href="#discussion">{this.__('Discussion')}</a></li>
                <li className="tab"><a href="#notes">{this.__('Notes')}</a></li>
                <li className="tab"><a href="#export">{this.__('Export')}</a></li>
              </ul>
              <div id="data" className="col s12" style={{height: 'calc(100% - 48px)', overflowY: 'auto', overflowX: 'hidden'}}>
                <p style={{fontSize: '16px'}}><b>Layer: </b><a href={layerUrl}>{this.props.layer.name}</a></p>
                <div className="row no-margin">
                  <div className="col m6 s12" style={{height: '140px', border: '1px solid #ddd'}}>
                    {locationDisplay}
                  </div>
                  <div className="col m6 s12" style={{height: '140px', border: '1px solid #ddd'}}>
                    {featureAreaDisplay}
                  </div>
                </div>


                <h5>{this.__('Attributes')}</h5>
                <Griddle results={data} showFilter={true} showSettings={false} resultsPerPage={10}
                  useFixedLayout={false} tableClassName="responsive-table highlight striped bordered"
                  useGriddleStyles={false} />
              </div>
              <div id="photo" className="col s12" style={{height: 'calc(100% - 48px)', textAlign: 'center'}}>
                {photo}
                {photoEditButton}
              </div>
              <div id="discussion" className="col s12" style={{height: 'calc(100% - 48px)'}}>
                <ReactDisqusThread
                      shortname="maphubs"
                      identifier={'maphubs-feature-' + this.props.layer.layer_id + '-' + this.props.feature.mhid + '-' + featureName}
                      url={baseUrl + '/feature/' + this.props.layer.layer_id + '/' + this.props.feature.mhid + '/' + featureName}
                      title={this.props.layer.layer_id + '/' + this.props.feature.mhid + '/' + featureName}
                      />
              </div>
              <div id="notes" className="col s12" style={{position: 'relative', height: 'calc(100% - 48px)'}}>
                <FeatureNotes editing={this.state.editingNotes}/>
                {notesEditButton}
              </div>
              <div id="export" className="col s12">
                {exportTabContent}
              </div>
            </div>

          </div>
            <div className="col s6 no-padding">
              <Map ref="map" className="map-absolute map-with-header width-50" 
              fitBounds={this.props.feature.geojson.bbox} 
              data={this.props.feature.geojson} 
              gpxLink={gpxLink}
              />
            </div>
          </div>
          {editButton}
          <ImageCrop ref="imagecrop" aspectRatio={1} lockAspect={true} resize_max_width={1000} resize_max_height={1000} onCrop={this.onCrop} />
        </main>
			</div>
		);
	}
}