var React = require('react');
var GroupTag = require('../Groups/GroupTag');
var $ = require('jquery');
var slug = require('slug');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var _isequal = require('lodash.isequal');

module.exports = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    layer: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string,
    image_url: React.PropTypes.string,
    background_image_url: React.PropTypes.string,
    link: React.PropTypes.string.isRequired,
    group: React.PropTypes.string,
    source: React.PropTypes.string,
    map: React.PropTypes.object,
    story: React.PropTypes.object,
    onClick: React.PropTypes.func.isRequired
  },

  onClick(){
    this.props.onClick(this.props.layer);
  },

  getInitialState() {
    var layer = this.props.layer;
    var image_url = '/api/screenshot/layer/thumbnail/' + layer.layer_id + '.jpg';
    return {
      mounted: false,
      id: layer.layer_id,
      title: layer.name,
      description: layer.description,
      image_url,
      source: layer.source,
      group: layer.owned_by_group_id,
      type: 'layer',
      link: '/layer/info/' + layer.layer_id + '/' + slug(layer.name)
    };
  },

  componentDidMount() {
    if(!this.state.mounted){
      this.setState({mounted: true});
    }

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

  componentDidUpdate(){
     $('.card-tooltip').tooltip();
  },

  render() {

    var group = '';
    if(this.state.group){
      group = (
        <div style={{position: 'absolute', bottom:1, left: 1}}>
          <GroupTag group={this.state.group} />
        </div>

      );
    }


    var typeIcon = '';
    var iconName = 'layers';
    var toolTipText = this.__('Layer');

    typeIcon = (
      <i className="material-icons grey-text text-darken-3 card-tooltip"
        style={{position: 'absolute', bottom:1, right: 1}}
        data-position="bottom" data-delay="50" data-tooltip={toolTipText}>
        {iconName}
      </i>
    );


    var cardContents = (<div className="carousel-card small"></div>);
    if(this.state.mounted){

      var image = (
        <div className="card-image">
          <img width="200" height="150" style={{borderBottom: '1px solid #757575'}} src={this.state.image_url} />
        </div>
      );

      cardContents = (  <div ref="card" className='hoverable margin5 small carousel-card card' onClick={this.onClick}>
          {image}

        <div className="card-content no-padding" style={{margin: '10px'}}>

          <b>{this.state.title}</b> <br />
            {group}

          <p className="fade" style={{fontSize: '12px'}}> {this.state.description}</p>
            {group}
            {typeIcon}
        </div>
        </div>
      );
    }

     return (
        <div>{cardContents}</div>
     );
  }
});
