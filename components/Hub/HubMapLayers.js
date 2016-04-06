var React = require('react');
//var debug = require('../../services/debug')('CreateMap');
//var config = require('../../clientconfig');
//var urlUtil = require('../../services/url-util');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var HubStore = require('../../stores/HubStore');
var slug = require('slug');
var HubActions = require('../../actions/HubActions');
var GroupTag = require('../../components/Groups/GroupTag');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');

var HubMapLayers = React.createClass({

  mixins:[StateMixin.connect(HubStore), StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    reloadMap: React.PropTypes.func.isRequired
  },

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

  toggleVisibility(layer_id){
    var _this = this;
    HubActions.toggleVisibility(layer_id, function(){
      _this.props.reloadMap(_this.state.hub.map_style);

    });
  },

  render() {
    var _this = this;
    //var baseUrl = urlUtil.getBaseUrl(config.host, config.port);

    return (
      <div>
        <ul ref="layers" className="collection no-margin">{
          this.state.layers.map(function (layer, i) {

            var icon = 'visibility', backgroundColor = 'inherit';
            if(!layer.active){
               icon = 'visibility_off';
               backgroundColor = '#eeeeee';
            }

            var moveUpButton = '', moveDownButton = '';
            if(i == 0){
              moveUpButton = (
                <a  className="create-map-btn" style={{cursor: 'default'}}>
                  <i className="material-icons grey-text">keyboard_arrow_up</i>
                  </a>
              );
            }else{
              moveUpButton = (
                <a onClick={function(){HubActions.moveUp(layer.layer_id);}}
                  className="create-map-btn"
                  data-position="top" data-delay="50" data-tooltip={_this.__('Move Up')}>
                  <i className="material-icons omh-accent-text">keyboard_arrow_up</i>
                  </a>
              );
            }

            if(i == _this.state.layers.length - 1){
              moveDownButton = (
                <a className="create-map-btn" style={{cursor: 'default'}}>
                  <i className="material-icons grey-text">keyboard_arrow_down</i>
                </a>
              );
            }else{
              moveDownButton = (
                <a onClick={function(){HubActions.moveDown(layer.layer_id);}}
                  className="create-map-btn"
                  data-position="top" data-delay="50" data-tooltip={_this.__('Move Down')}>
                  <i className="material-icons omh-accent-text">keyboard_arrow_down</i>
                </a>
              );
            }

            /*eslint-disable react/no-danger*/
            return (
              <li key={layer.layer_id} className="collection-item"
                style={{height: '70px', paddingRight: '10px', paddingLeft: '10px', backgroundColor}}>
                  <b className="title truncate grey-text text-darken-4" style={{fontSize: '12px'}}>{layer.name}</b>
                <div className="title col no-padding s6">
                  <GroupTag group={layer.owned_by_group_id} />
                  <p className="truncate no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{layer.source}</p>
                </div>
                  <div className="secondary-content col s6 no-padding">

                    <div className="col s3 no-padding">
                      <a href={'/layer/info/'+ layer.layer_id + '/' + slug(layer.name)} target="_blank"
                        className="create-map-btn"
                        data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
                        <i className="material-icons omh-accent-text">info</i>
                        </a>
                    </div>
                    <div className="col s3 no-padding">
                      <a onClick={function(){_this.toggleVisibility(layer.layer_id);}}
                        className="create-map-btn"
                        data-position="top" data-delay="50" data-tooltip={_this.__('Toggle Visibility')}>
                        <i className="material-icons omh-accent-text">{icon}</i>
                      </a>
                    </div>
                    <div className="col s3 no-padding">
                      {moveUpButton}
                   </div>
                   <div className="col s3 no-padding">
                     {moveDownButton}
                  </div>

                  </div>
              </li>);
              /*eslint-enable react/no-danger*/
          })
        }</ul>
    </div>
    );
  }

});

module.exports = HubMapLayers;
