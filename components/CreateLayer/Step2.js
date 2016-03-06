var React = require('react');
var classNames = require('classnames');

var Radio = require('../forms/radio');
var Formsy = require('formsy-react');
var LocalSource = require('./LocalSource');
var MapboxSource = require('./MapboxSource');
var RasterTileSource = require('./RasterTileSource');
//var GithubSource = require('./GithubSource');
var AGOLSource = require('./AGOLSource');
//var OSMSource = require('./OSMSource');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

require('../../stores/preset-store'); //needed to init the store used by the source options

var Step2 = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired,
    active: React.PropTypes.bool.isRequired,
    showPrev: React.PropTypes.bool,
    onPrev: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      onSubmit: null,
      active: false
    };
  },

  getInitialState() {
    return {
      canSubmit: false,
      selectedSource: 'local'
    };
  },

  sourceChange(value){
    this.setState({selectedSource: value});
  },

  onPrev() {
    if(this.props.onPrev) this.props.onPrev();
  },

  onSubmit() {
    this.props.onSubmit();
  },

	render() {

    //hide if not active
    var className = classNames('container');
    if(!this.props.active) {
      className = classNames('container', 'hidden');
    }
    //{value: 'osm', label: 'Import from OpenStreetMap (read-only)'},
    //{value: 'github', label: 'Github GeoJSON File'},
    var sourceOptions = [
      {value: 'local', label: this.__('Load Data into MapHubs (recommended)')},
      {value: 'mapbox', label: this.__('Link to a Mapbox Style or Tileset')},
      {value: 'raster', label: this.__('Link to Raster Tile Service')},

      {value: 'ags', label: this.__('Link to an ArcGIS Online Map Service or Feature Service')}
    ];
    // osm=false,github = false,
    var local = false, mapbox = false, raster = false, ags = false;
    switch(this.state.selectedSource){
      case 'local':
        local = true;
        break;
      //case 'osm':
      //  osm = true;
      //  break;
      case 'mapbox':
        mapbox = true;
        break;
      case 'raster':
        raster = true;
        break;
      //case 'github':
      //  github = true;
      //  break;
      case 'ags':
        ags = true;
        break;
      default:
      break;
    }

    //<OSMSource active={osm} showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />
    //<GithubSource active={github} showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />
		return (
        <div className={className}>
          <h5 style={{marginLeft: '-0.5rem'}}>1) Choose a Data Source</h5>
          <Formsy.Form>

            <div  className="row" style={{marginLeft: '-1.5rem'}}>
              <Radio name="type" label=""
                  defaultValue={this.state.selectedSource}
                  options={sourceOptions} onChange={this.sourceChange}
                  className="col s8"
                />
            </div>
            <hr />
          </Formsy.Form>
          <LocalSource active={local} showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />
          <MapboxSource active={mapbox} showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />
          <RasterTileSource active={raster} showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />
          <AGOLSource active={ags} showPrev={true} onPrev={this.onPrev} onSubmit={this.onSubmit} />


      </div>
		);
	}
});

module.exports = Step2;
