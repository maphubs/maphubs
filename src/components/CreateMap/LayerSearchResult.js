var React = require('react');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var urlUtil = require('../../services/url-util');
var slug = require('slug');
var GroupTag = require('../Groups/GroupTag');


var LayerSearchResult = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    layer: React.PropTypes.object.isRequired,
    onAdd: React.PropTypes.func.isRequired
  },

  shouldComponentUpdate(){
    return false;
  },

  render(){
    var _this = this;
  return (
    <div>
      <div className="title col s8">
        <b className="title truncate grey-text text-darken-4 tooltipped layer-card-tooltipped"
          style={{fontSize: '12px'}}
          data-position="top" data-tooltip={this.props.layer.name}>
          {this.props.layer.name}
        </b>
          <GroupTag group={this.props.layer.owned_by_group_id} showTooltip={false} />
        <p className="truncate no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{this.props.layer.source}</p>
      </div>

      <div className="secondary-content col s4 no-padding">
        <div className="row no-padding no-margin">
          <div className="col s4 no-padding right">
            <a onClick={
              function(){
                _this.props.onAdd(_this.props.layer);
              }}
              className="create-map-btn layer-card-tooltipped"
              data-position="top" data-delay="50" data-tooltip={_this.__('Add to Map')}>
              <i className="material-icons omh-accent-text">add</i></a>
          </div>
          <div className="col s4 no-padding right">
            <a href={urlUtil.getBaseUrl() + '/layer/info/'+ this.props.layer.layer_id + '/' + slug(this.props.layer.name)} target="_blank"
              className="create-map-btn layer-card-tooltipped"
              data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
              <i className="material-icons omh-accent-text">info</i>
            </a>
          </div>
        </div>
        <div className="row no-padding no-margin">

        </div>
      </div>
</div>



  );

  }

});

module.exports = LayerSearchResult;
