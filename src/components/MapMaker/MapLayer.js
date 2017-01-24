var React = require('react');

var slug = require('slug');
var GroupTag = require('../Groups/GroupTag');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var $ = require('jquery');

var MapLayer = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    showVisibility: React.PropTypes.bool,
    toggleVisibility: React.PropTypes.func.isRequired,
    removeFromMap: React.PropTypes.func.isRequired,
    showLayerDesigner: React.PropTypes.func.isRequired,
    moveUp: React.PropTypes.func.isRequired,
    moveDown: React.PropTypes.func.isRequired,
    layer: React.PropTypes.object.isRequired
  },

  getDefaultProps(){
    return {
      showVisibility: false
    };
  },

  getInitialState(){
    return {
    };
  },

  componentDidMount(){
    $('.map-layer-tooltipped').tooltip();
  },

  resetTooltips(){
    $('.map-layer-tooltipped').tooltip('remove');
    $('.map-layer-tooltipped').tooltip();
  },

  removeFromMap(layer){
    $('.map-layer-tooltipped').tooltip('remove');
    this.props.removeFromMap(layer);
  },

  render(){
    var _this = this;
    var layer = _this.props.layer;
    var visibilityButton = '';
    if(_this.props.showVisibility){
      var icon = 'visibility';
      if(!layer.active) icon = 'visibility_off';
        visibilityButton = (
          <a onClick={function(){_this.props.toggleVisibility(layer.layer_id);}}
            className="create-map-btn map-layer-tooltipped"
            data-position="top" data-delay="50" data-tooltip={_this.__('Show/Hide Layer')}>
            <i className="material-icons omh-accent-text">{icon}</i>
          </a>
        );
    }
    return (
      <li key={layer.layer_id} className="collection-item"
        style={{height: '90px', paddingRight: '5px', paddingLeft: '5px', paddingTop: '0px', paddingBottom: '0px', overflow: 'hidden', border: '1px solid #ddd'}}>
        <div className="title row no-margin">
          <b className="title truncate grey-text text-darken-4 map-layer-tooltipped"
            style={{fontSize: '12px'}}
            data-position="top" data-tooltip={layer.name}>
            {layer.name}
          </b>
          <GroupTag group={layer.owned_by_group_id} />
          <p className="truncate no-margin no-padding grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{layer.source}</p>
        </div>
          <div className="row">
            <div className="col s2 no-padding">
              <a href={'/layer/info/'+ layer.layer_id + '/' + slug(layer.name ? layer.name : '')} target="_blank"
                className="create-map-btn map-layer-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
                <i className="material-icons omh-accent-text">info</i>
                </a>
            </div>
            <div className="col s2 no-padding">
             {visibilityButton}
            </div>
            <div className="col s2 no-padding">
              <a onClick={function(){_this.removeFromMap(layer);}}
                className="create-map-btn map-layer-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Remove from Map')}>
                <i className="material-icons omh-accent-text">delete</i></a>
            </div>
            <div className="col s2 no-padding">
              <a onClick={function(){_this.props.showLayerDesigner(layer); _this.resetTooltips();}}
                className="create-map-btn map-layer-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Edit Layer Style')}>
                <i className="material-icons omh-accent-text">color_lens</i></a>
            </div>
            <div className="col s2 no-padding">
              <a onClick={function(){_this.props.moveUp(layer);}}
                className="create-map-btn map-layer-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Move Up')}>
                <i className="material-icons omh-accent-text">keyboard_arrow_up</i>
              </a>
            </div>
            <div className="col s2 no-padding">
              <a onClick={function(){_this.props.moveDown(layer);}}
                className="create-map-btn map-layer-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Move Down')}>
                <i className="material-icons omh-accent-text">keyboard_arrow_down</i>
              </a>
            </div>
          </div>
      </li>);
  }

});

module.exports = MapLayer;
