var React = require('react');
var GroupTag = require('../Groups/GroupTag');
var MapCardUserTag = require('./MapCardUserTag');
var $ = require('jquery');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

module.exports = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    description: React.PropTypes.string.isRequired,
    image_url: React.PropTypes.string.isRequired,
    background_image_url: React.PropTypes.string,
    link: React.PropTypes.string.isRequired,
    group: React.PropTypes.string,
    source: React.PropTypes.string,
    map: React.PropTypes.object,
    type: React.PropTypes.string
  },

  onClick(){
    if (typeof window !== 'undefined') {
      window.location = this.props.link;
    }
  },

  getInitialState() {
    return {mounted: false};
  },

  componentDidMount() {
    if(!this.state.mounted){
      this.setState({mounted: true});
    }

  },

  componentDidUpdate(){
     $('.card-tooltip').tooltip();
  },

  render() {

    var group = '';
    if(this.props.group){
      group = (
        <div style={{position: 'absolute', bottom:1, left: 1}}>
          <GroupTag group={this.props.group} />
        </div>

      );
    }

    /*
    var source = '';

    if(this.props.source){
      source = (
        <p className="truncate right no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{this.props.source}</p>
      );
    }
    */

    var typeIcon = '', iconName = '', toolTipText = '', 
    mapCardUserTag= '',
    storyTag = '';
    if(this.props.type){
      if(this.props.type == 'layer'){
        iconName = 'layers';
        toolTipText = this.__('Layer');
      }else if(this.props.type == 'group'){
        iconName = 'supervisor_account';
        toolTipText = this.__('Group');
      }else if(this.props.type == 'hub'){
        iconName = 'web';
        toolTipText = 'Hub';
      }else if(this.props.type == 'story'){
        iconName = 'library_books';
        toolTipText = this.__('Story');
      }else if(this.props.type == 'map'){
        iconName = 'map';
        toolTipText = this.__('Map');
        mapCardUserTag = (
          <div style={{position: 'absolute', bottom:1, left: 1, width: '200px'}}>
            <MapCardUserTag map={this.props.map} />
          </div>
        );
      }

      typeIcon = (
        <i className="material-icons grey-text text-darken-3 card-tooltip"
          style={{position: 'absolute', bottom:1, right: 1}}
          data-position="bottom" data-delay="50" data-tooltip={toolTipText}>
          {iconName}
        </i>
      );
    }

    var cardContents = (<div className="carousel-card small"></div>);
    if(this.state.mounted){
      var image = '';
      if(this.props.type == 'hub'){
        image = (
          <div className="card-image valign-wrapper" style={{borderBottom: '1px solid #757575', height: '150px'}}>
            <img className="responsive-img" style={{position: 'absolute', objectFit: 'cover', height: '150px'}} src={this.props.background_image_url} />
            <img className="valign" width="100" height="100" style={{position: 'relative',width: '100px', borderRadius: '25px', margin: 'auto'}}  src={this.props.image_url} />
          </div>
        );
      }else{
        image = (
          <div className="card-image">
            <img width="200" height="150" style={{borderBottom: '1px solid #757575'}} src={this.props.image_url} />
          </div>
        );
      }
      cardContents = (  <div ref="card" className='hoverable margin5 small carousel-card card' onClick={this.onClick}>
          {image}

        <div className="card-content no-padding" style={{margin: '10px'}}>

          <b>{this.props.title}</b> <br />
            {group}

          <p className="fade" style={{fontSize: '12px'}}> {this.props.description}</p>
            {mapCardUserTag}
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
