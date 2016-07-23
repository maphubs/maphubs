var React = require('react');

var slug = require('slug');
var GroupTag = require('../Groups/GroupTag');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

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

  render(){
    var _this = this;
    var layer = _this.props.layer;
    var visibilityButton = '';
    if(_this.props.showVisibility){
      var icon = 'visibility';
      if(!layer.active) icon = 'visibility_off';
        visibilityButton = (
          <a onClick={function(){_this.props.toggleVisibility(layer.layer_id);}}
            className="create-map-btn layer-card-tooltipped"
            data-position="top" data-delay="50" data-tooltip={_this.__('Show/Hide Layer')}>
            <i className="material-icons omh-accent-text">{icon}</i>
          </a>
        );
    }
    return (
      <li key={layer.layer_id} className="collection-item"
        style={{height: '70px', paddingRight: '5px', paddingLeft: '5px', paddingTop: '0px', paddingBottom: '0px', overflow: 'hidden', border: '1px solid #ddd'}}>
        <div className="title col s8">
          <b className="title truncate grey-text text-darken-4 layer-card-tooltipped"
            style={{fontSize: '12px'}}
            data-position="top" data-tooltip={layer.name}>
            {layer.name}
          </b>
          <GroupTag group={layer.owned_by_group_id} />
          <p className="truncate no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{layer.source}</p>
        </div>
          <div className="secondary-content col s4 no-padding">

            <div className="col s4 no-padding">
              <a href={'/layer/info/'+ layer.layer_id + '/' + slug(layer.name ? layer.name : '')} target="_blank"
                className="create-map-btn layer-card-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
                <i className="material-icons omh-accent-text">info</i>
                </a>
            </div>
            <div className="col s4 no-padding">
             {visibilityButton}
            </div>
            <div className="col s4 no-padding">
            <div className="fixed-action-btn horizontal"
              style={{
                position: 'relative',
                right: 0,
                paddingLeft: '5px',
                bottom: 0,
                height: '70px'}}>
               <a className="create-map-btn">
                 <i className="material-icons omh-accent-text">more_horiz</i>
               </a>
               <ul style={{
                   height: '40px',
                   bottom: '0px',
                  right: '50%',
                  width: '215px'
                }}>
                 <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.props.removeFromMap(layer);}} className="btn-floating red layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Remove from Map')}><i className="material-icons">remove</i></a></li>
                 <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.props.showLayerDesigner(layer);}} className="btn-floating amber darken-4 layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Edit Layer Style')}><i className="material-icons">color_lens</i></a></li>
                 <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.props.moveUp(layer);}} className="btn-floating omh-color layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Move Up')}><i className="material-icons">keyboard_arrow_up</i></a></li>
                 <li className="create-map-popup-btn no-padding"><a onClick={function(){_this.props.moveDown(layer);}} className="btn-floating omh-color layer-card-tooltipped" data-position="top" data-delay="50" data-tooltip={_this.__('Move Down')}><i className="material-icons">keyboard_arrow_down</i></a></li>
               </ul>
             </div>
           </div>
          </div>
      </li>);
  }

});

module.exports = MapLayer;
