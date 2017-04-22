import React from 'react';
import PropTypes from 'prop-types';

import Reflux from 'reflux';
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var LocaleMixin = require('../LocaleMixin');
var LayerSourceMixin = require('./LayerSourceMixin');
var SourceSelectionBox = require('./SourceSelectionBox');

var CreateLayer = React.createClass({

   mixins:[StateMixin.connect(LocaleStore), LocaleMixin, LayerSourceMixin],

   propTypes: {
    onSubmit: PropTypes.func.isRequired,
    showPrev: PropTypes.bool,
    onPrev: PropTypes.func,
    onCancel: PropTypes.func
  },

   getInitialState() {
    return {
      canSubmit: false,
      source: ''
    };
  },

   selectSource(source){
    this.setState({source});
   },


   onCancel() {
      if(this.props.onCancel) this.props.onCancel();
    },

    onPrev() {
      if(this.props.onPrev) this.props.onPrev();
    },

    onSubmit() {
      this.props.onSubmit();
    },

   render() {
    
    var sourceDisplay = this.getSource(this.state.source);

    var planetSource = '';
    if(MAPHUBS_CONFIG.mapHubsPro){
      planetSource = (
         <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('Planet API')} value={'planet'}
            selected={this.state.source === 'planet'} icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
      );
    }

    return (
      <div>
        <div className="row" style={{maxWidth: '500px', margin: 'auto'}}>
          <div className="col s6 m4 l4">
            <SourceSelectionBox name={this.__('New Point(s)')} value={'point'} 
            selected={this.state.source === 'point'} icon="place"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m4 l4">
            <SourceSelectionBox name={this.__('New Line(s)')} value={'line'} 
            selected={this.state.source === 'line'} icon="timeline"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m4 l4">
            <SourceSelectionBox name={this.__('New Polygon(s)')} value={'polygon'} 
            selected={this.state.source === 'polygon'} icon="crop_din"
            onSelect={this.selectSource} />
          </div>
        </div>
        <div className="row" style={{maxWidth: '800px', margin: 'auto'}}>
          <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('Upload File')} value={'local'} 
            selected={this.state.source === 'local'} icon="file_upload"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('GeoJSON URL')} value={'geojson'} 
            selected={this.state.source === 'gejosn'} icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('Mapbox Styles')} value={'mapbox'} 
            selected={this.state.source === 'mapbox'} icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
           <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('Raster Tiles')} value={'raster'}
            selected={this.state.source === 'raster'}  icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('Vector Tiles')} value={'vector'}
            selected={this.state.source === 'vector'}  icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('ArcGIS Services')} value={'ags'} 
            selected={this.state.source === 'ags'} icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
          <div className="col s6 m3 l2">
            <SourceSelectionBox name={this.__('MapHubs Layer')} value={'remote'} 
            selected={this.state.source === 'ags'} icon="cloud_download"
            onSelect={this.selectSource} />
          </div>
          {planetSource}
        </div>
        <div className="divider" />
        <div className="container">
          {sourceDisplay}
        </div>
        
      </div>
    );
   }

});

module.exports = CreateLayer;
