var React = require('react');

var Map = require('../components/Map/Map');
var Header = require('../components/header');
var slug = require('slug');
var config = require('../clientconfig');
var urlUtil = require('../services/url-util');
var styles = require('../components/Map/styles');
var $ = require('jquery');
var ReactDisqusThread = require('react-disqus-thread');
var Griddle = require('griddle-react');

var FeatureNotes = require('../components/Feature/FeatureNotes');
var HubEditButton = require('../components/Hub/HubEditButton');

var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var FeatureNotesActions = require('../actions/FeatureNotesActions');
var FeatureNotesStore = require('../stores/FeatureNotesStore');
var Locales = require('../services/locales');

var FeatureInfo = React.createClass({

  mixins:[
      StateMixin.connect(LocaleStore, {initWithProps: ['locale']}),
      StateMixin.connect(FeatureNotesStore, {initWithProps: ['notes']})
    ],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    feature: React.PropTypes.object.isRequired,
    notes: React.PropTypes.string.isRequired,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      editingNotes: false
    };
  },

  componentDidMount(){
    $('ul.tabs').tabs();
    var _this = this;
    window.onbeforeunload = function(){
      if(_this.state.editingNotes){
        return _this.__('You have not saved your edits, your changes will be lost.');
      }
    };
  },

  startEditing(){
    this.setState({editingNotes: true});
  },

  stopEditing(){
    var _this = this;
    var geoJSONProps = this.props.feature.geojson.features[0].properties;

    FeatureNotesActions.saveNotes(this.props.feature.layer.layer_id, geoJSONProps.osm_id, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Notes Saved')});
        _this.setState({editingNotes: false});
      }
    });

  },


	render() {

    var glStyle = null;

    if(this.props.feature && this.props.feature.layer && this.props.feature.geojson){
      glStyle = this.props.feature.layer.style ? this.props.feature.layer.style : styles[this.props.feature.layer.data_type];

      var featureName = "Feature";
      if(this.props.feature.geojson.features && this.props.feature.geojson.features.length > 0){
        var geoJSONProps = this.props.feature.geojson.features[0].properties;
        if(geoJSONProps.name) {
          featureName = geoJSONProps.name;
        }
      }

      var data = [];
      for (var key in geoJSONProps){
        data.push({tag: key, value: geoJSONProps[key]});
      }
    }

    var editButton = '';

    if(this.props.canEdit){
      editButton = (
        <HubEditButton editing={this.state.editingNotes}
          style={{position: 'absolute'}}
          startEditing={this.startEditing} stopEditing={this.stopEditing} />
      );
    }

    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    var layerUrl = baseUrl + '/layer/info/' + this.props.feature.layer.layer_id + '/' + slug(this.props.feature.layer.name);
		return (
      <div>
        <Header />
        <main style={{height: 'calc(100% - 52px)', marginTop: '0px'}}>
        <div className="row" style={{height: '100%', margin: 0}}>
          <div className="col s6 no-padding" style={{height: '100%'}}>
            <div style={{margin: '10px'}}>
              <h4>{featureName}</h4>
              <p style={{fontSize: '16px'}}><b>Layer: </b><a href={layerUrl}>{this.props.feature.layer.name}</a></p>
            </div>

            <div className="row no-margin" style={{height: 'calc(100% - 108px)'}}>
              <ul className="tabs">
                <li className="tab col s4"><a className="active" href="#data">{this.__('Data')}</a></li>
                <li className="tab col s4"><a href="#discussion">{this.__('Discussion')}</a></li>
                <li className="tab col s4"><a href="#notes">{this.__('Notes')}</a></li>
              </ul>
              <div id="data" className="col s12" style={{height: 'calc(100% - 48px)'}}>
                <Griddle results={data} showFilter={true} showSettings={false} resultsPerPage={10}
                  useFixedLayout={false} tableClassName="responsive-table highlight striped bordered"
                  useGriddleStyles={false} />
              </div>
              <div id="discussion" className="col s12" style={{height: 'calc(100% - 48px)'}}>
                <ReactDisqusThread
                      shortname="openmaphub"
                      identifier={'openmaphub-feature-' + this.props.feature.osm_id}
                      title={featureName}
                      />
              </div>
              <div id="notes" className="col s12" style={{position: 'relative', height: 'calc(100% - 48px)'}}>
                <FeatureNotes editing={this.state.editingNotes}/>
                {editButton}
              </div>
            </div>

          </div>
            <div className="col s6 no-padding">
              <Map ref="map" className="map-absolute map-with-header width-50" glStyle={glStyle} fitBounds={this.props.feature.geojson.bbox} data={this.props.feature.geojson} />
            </div>
          </div>

        </main>
			</div>
		);
	}
});

module.exports = FeatureInfo;
