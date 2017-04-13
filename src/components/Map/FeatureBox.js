var React = require('react');

var Attributes = require('./Attributes');
var classNames = require('classnames');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var request = require('superagent');
var checkClientError = require('../../services/client-error-response').checkClientError;
var urlUtil = require('../../services/url-util');
var GroupTag = require('../../components/Groups/GroupTag');
var $ = require('jquery');

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
      showButtons: true,
      selected: false
    };
  },

  getInitialState() {
    return {
    selectedFeature: 1,
    selected: this.props.selected,
    currentFeatures: this.props.features ? this.props.features : [],
    maxHeight: 'calc(100% - 50px)',
    layerLoaded: false
  };
  },

  componentDidMount(){
    if(this.props.selected && this.props.features){
      var selectedFeature = this.props.features[0];
      if(selectedFeature.properties.layer_id){
          this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host);
      }else{
        this.setState({layerLoaded: true});
      }
    }  
  },

  componentWillReceiveProps(nextProps) {
    //only take updates if we are not selected, otherwise data will update when user moves the mouse
    if((!this.state.selected) ){
      if(nextProps.selected){
        //put this component into selected mode
        //it will ignore all updates from the parent until closed
        var features = null;
        if(this.state.currentFeatures && this.state.currentFeatures.length > 0){
          features = this.state.currentFeatures;
          this.setState({selected: nextProps.selected, selectedFeature: 1});
        }else{
          features = nextProps.features;
          this.setState({currentFeatures: nextProps.features, selected: nextProps.selected, selectedFeature: 1});
        }

        var selectedFeature = features[0];
        if(selectedFeature.properties.layer_id){
            this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host);
        }else{
          this.setState({layerLoaded: true});
        }

      } else {
        this.setState({currentFeatures: nextProps.features});
      }

    }
  },

  componentDidUpdate(prevProps, prevState){
    if(!prevState.layerLoaded && this.state.layerLoaded){
      $('.feature-box-tooltips').tooltip();
    }
  },

  getLayer(layer_id, host){
    var _this = this;
    var baseUrl;
    if(host && host !== 'dev.docker' && host !== window.location.hostname){
      baseUrl = 'https://' + host;
    }else{
      baseUrl = urlUtil.getBaseUrl();
    }
    request.get(baseUrl + '/api/layer/info/' + layer_id)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(){}, function(cb){
        var layer = res.body.layer;
        _this.setState({layer, layerLoaded: true});
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
        this.getLayer(selectedFeature.properties.layer_id, selectedFeature.properties.maphubs_host);
    }else{
       this.setState({layerLoaded: true});
    }
  },

  render() {
    var _this = this;
    var closeButton = '';
    var header = '';
    var infoPanel = '';
    var pager = '';

    var baseUrl = urlUtil.getBaseUrl();

    if(this.state.selected){
      closeButton = (
        <a style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}}>
          <i className="material-icons selected-feature-close" onClick={this.handleCloseSelected}>close</i>
        </a>
      );

      if(this.state.currentFeatures.length === 1){
        header=(<h6 style={{position: 'absolute', top: 0, left: '5px', fontSize: '12px'}}>{this.__('Selected Feature')}</h6>);
      }else if(this.state.currentFeatures.length > 1){
        header=(<h6 style={{position: 'absolute', top: 0, left: '5px', fontSize: '12px'}}>{this.__('Selected Features')}</h6>);
      }
      if(this.props.showButtons){
        var mhid = -1;
        var layer_id = null;
        var host = null;
        var featureName = 'unknown';
        if(this.state.currentFeatures.length > 0){
          var currentFeature = this.state.currentFeatures[this.state.selectedFeature-1];
          if(currentFeature && currentFeature.properties){
            mhid = currentFeature.properties.mhid;
            layer_id = currentFeature.properties.layer_id;
            host = currentFeature.properties.maphubs_host;
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
              <b><a className="truncate" target="_blank" href={baseUrl + '/lyr/' + this.state.layer.layer_id}>{this.state.layer.name}</a></b>
              <GroupTag className={'left'} group={this.state.layer.owned_by_group_id} size={15} fontSize={8} />
            </div>
          );
        }

        var featureLink, featureID;
        if(typeof mhid === 'string' && mhid.includes(':')){
          featureID = mhid.split(':')[1];
        }else{
          featureID = mhid;
        }
        if(host === window.location.hostname || host === 'dev.docker'){      
          featureLink = '/feature/' + layer_id + '/' + featureID + '/' + featureName;
        }else{
          featureLink = 'https://' + host + '/feature/' + layer_id + '/' + featureID + '/' + featureName;
        }
        var featureButton = '';
        if(host && featureLink){
          featureButton = (
            <a href={featureLink}
              className="feature-box-tooltips" data-delay="50" data-position="bottom" data-tooltip={this.__('More Info')}>
            <i className="material-icons omh-accent-color" style={{fontSize: 32}}>info_outline</i>
          </a>
          );
        }
      infoPanel = (<div className="row" style={{marginTop: '10px', marginBottom: '10px'}}>
        <div className="col s10 center">
        {layerinfo}
        </div>
        <div className="col s2 center no-padding">
          {featureButton}
        </div>
      </div>);
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
        infoPanel = (<h6 className="center-align" style={{margin: 'auto'}}>{this.__('Click to Select')}</h6>);
      }

    }
    var multipleSelected = false;
    if(this.props.showButtons && this.state.selected && this.state.currentFeatures.length > 1){
      multipleSelected = true;
    }
    //only show the panel if there is at least one feature active
    var display = 'none';
    var attributes = '';
    var properties = [];
    if(this.state.currentFeatures.length > 0 && this.state.layerLoaded){
      display = 'flex';     
      currentFeature = this.state.currentFeatures[this.state.selectedFeature-1];
      if(currentFeature && currentFeature.properties){
        properties = currentFeature.properties;
      }
      var presets;
      if(this.state.layer){
        presets = this.state.layer.presets;
      }
        attributes = (
          <Attributes
              attributes={properties}
              selected={this.state.selected}
              multipleSelected={multipleSelected}
              presets={presets}>
            <div style={{position: 'absolute', bottom: 0, width: '100%',  backgroundColor: '#FFF', borderTop: '1px solid #DDD'}}>
              {infoPanel}
              {pager}
            </div>
          </Attributes>

        );
    }


    var className = classNames('features', 'card', this.props.className);

    return (
        <div className={className} style={{display, maxHeight: this.state.maxHeight}}>
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
