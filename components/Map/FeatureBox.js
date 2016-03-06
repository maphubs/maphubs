var React = require('react');

var Attributes = require('./Attributes');
var classNames = require('classnames');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var request = require('superagent');
var checkClientError = require('../../services/client-error-response').checkClientError;
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');
var GroupTag = require('../../components/Groups/GroupTag');

var FeatureBox = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		features: React.PropTypes.array.isRequired,
    selected: React.PropTypes.bool.isRequired,
    onUnselected: React.PropTypes.func.isRequired,
    showButtons: React.PropTypes.bool,
    className: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      showButtons: true
    };
  },

  getInitialState() {
    return {
    selectedFeature: 1,
    selected: false,
    currentFeatures: []
  };
  },

  componentWillReceiveProps(nextProps) {
    //only take updates if we are not selected, otherwise data will update when user moves the mouse
    if((!this.state.selected) ){
      if(nextProps.selected){
        //put this component into selected mode
        //it will ignore all updates from the parent until closed
        this.setState({selected: nextProps.selected, selectedFeature: 1});
        var selectedFeature = this.state.currentFeatures[0];
        if(selectedFeature.properties.layer_id){
            this.getLayer(selectedFeature.properties.layer_id, function(){});
        }

      } else {
        this.setState({currentFeatures: nextProps.features});
      }

    }
  },

  getLayer(layer_id, cb){
    var _this = this;
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    request.get(baseUrl + '/api/layer/info/' + layer_id)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, cb, function(cb){
        var layer = res.body.layer;
        _this.setState({layer});
        cb();
      });
    });
  },

  handleCloseSelected() {
    this.setState({selected: false, currentFeatures: [], selectedFeature: 1});
    this.props.onUnselected();
  },

  handleChangeSelectedFeature(selectedFeature){
    this.setState({selectedFeature});
    if(selectedFeature.properties.layer_id){
        this.getLayer(selectedFeature.properties.layer_id, function(){});
    }
  },

  render() {
    var _this = this;
    var closeButton = '';
    var header = '';
    var infoPanel = '';
    var pager = '';

    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);

    if(this.state.selected){
      closeButton = (
        <a className="omh-btn" style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}}>
          <i className="material-icons selected-feature-close" onClick={this.handleCloseSelected}>close</i>
        </a>
      );

      header=(<h6 style={{position: 'absolute', top: 0, left: '5px'}}>{this.__('Selected Feature(s)')}</h6>);

      if(this.props.showButtons){
        var osm_id = -1;
        var layer_id = null;
        var featureName = 'unknown';
        if(this.state.currentFeatures.length > 0){
          var currentFeature = this.state.currentFeatures[this.state.selectedFeature-1];
          if(currentFeature && currentFeature.properties){
            osm_id = currentFeature.properties.osm_id;
            layer_id = currentFeature.properties.layer_id;
            var nameFields = ['name', 'Name', 'NAME', 'nom', 'Nom', 'NOM', 'nombre', 'Nombre', 'NOMBRE'];
            nameFields.forEach(function(name){
              if(featureName == 'unknown' && currentFeature.properties[name]){
                featureName = currentFeature.properties[name];
              }
            });
          }
        }

        var layerinfo = '';
        if(this.state.layer){
          layerinfo = (
            <div style={{textAlign: 'left'}}>
              <b><a target="_blank" href={baseUrl + '/lyr/' + this.state.layer.layer_id}>{this.state.layer.name}</a></b>
              <GroupTag className={'left'} group={this.state.layer.owned_by_group_id} size={15} fontSize={8} />
            </div>
          );
        }


      infoPanel = (<div className="row">
        <div className="col s6 center">
        {layerinfo}
        </div>
        <div className="col s6 center">
          <a href={'/feature/' + layer_id + '/' + osm_id + '/' + featureName}
              className="btn-floating waves-effect waves-light tooltipped" data-delay="50" data-position="bottom" data-tooltip={this.__('Layer Info')}>
            <i className="material-icons">info</i>
          </a>
        </div>
      </div>);
      }
      if(this.state.currentFeatures.length > 1){
        var index = this.state.selectedFeature;
        var leftButton = (
          <li className="waves-effect"><a  onClick={function(){var newIndex = index-1; _this.handleChangeSelectedFeature(newIndex);}}><i className="material-icons">chevron_left</i></a></li>
        );
        if(index == 1) {
          leftButton = (
            <li className="disabled"><a><i className="material-icons">chevron_left</i></a></li>
          );
        }
        var rightButton = (
          <li className="waves-effect"><a onClick={function(){var newIndex = index+1; _this.handleChangeSelectedFeature(newIndex);}}><i className="material-icons">chevron_right</i></a></li>
        );
        if(index == this.state.currentFeatures.length) {
          rightButton = (
            <li className="disabled"><a><i className="material-icons">chevron_right</i></a></li>
          );
        }
        pager = (
          <ul className="pagination margin-auto">
              {leftButton}
                {this.state.currentFeatures.map(function(feature, i){
                  if (i + 1 == index){
                    return (
                    <li key={i} className="active omh-color"><a>{i+1}</a></li>
                    );
                  }
                  return (
                  <li key={i} className="waves-effect"><a onClick={function(){var newIndex = i+1; _this.handleChangeSelectedFeature(newIndex);}}>{i+1}</a></li>
                  );
                })}
                {rightButton}
              </ul>
        );
      }
    } else{ //Feature is hovered, but not selected
      if(this.state.currentFeatures.length > 1){
        infoPanel = (
          <div>
            {this.__('Showing Feature 1 of')} {this.state.currentFeatures.length}
          <p>{this.__('Click to View All')}</p>
        </div>
      );
      } else {
        infoPanel = (<b className="center-align" style={{margin: 'auto'}}>{this.__('Click to Select')}</b>);
      }

    }
    var multipleSelected = false;
    if(this.props.showButtons && this.state.selected && this.state.currentFeatures.length > 1){
      multipleSelected = true;
    }
    //only show the panel if there is at least one feature active
    var display = 'none';
    var attributes = '';
    if(this.state.currentFeatures.length > 0){
      display = 'flex';
      var properties = [];
      currentFeature = this.state.currentFeatures[this.state.selectedFeature-1];
      if(currentFeature && currentFeature.properties){
        properties = currentFeature.properties;
      }
      attributes = (
        <Attributes
            attributes={properties}
            selected={this.state.selected}
            multipleSelected={multipleSelected}>
          <div style={{position: 'absolute', bottom: 0, width: '100%',  backgroundColor: 'rgba(238, 238, 238, 0.75)', paddingTop: '10px'}}>
            {infoPanel}
            {pager}
          </div>
        </Attributes>

      );
    }


    var className = classNames('features', 'card', this.props.className);

    return (
        <div className={className} style={{display}}>
          <div className="features-container">
            {closeButton}
            {header}
            <div style={{width: '100%', display: 'flex'}}>

                {attributes}
            </div>


          </div>
        </div>


    );
  }
});

module.exports = FeatureBox;
