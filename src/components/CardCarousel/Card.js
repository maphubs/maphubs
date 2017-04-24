//@flow
import React from 'react';
import GroupTag from '../Groups/GroupTag';
import MapCardUserTag from './MapCardUserTag';
import StoryHeader from '../Story/StoryHeader';
var $ = require('jquery');
var _isequal = require('lodash.isequal');
import MapHubsComponent from '../../components/MapHubsComponent';

export default class Card extends MapHubsComponent {

  props:  {
    id: string,
    title: string,
    description: string,
    image_url: string,
    background_image_url: string,
    link: string,
    group: string,
    source: string,
    data: Object,
    type: string,
    private: boolean,
    onClick: Function
  }

  state = {
    mounted: false
  }

  componentDidMount() {
    if(!this.state.mounted){
      this.setState({mounted: true});
    }
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  componentDidUpdate(){
     $('.card-tooltip').tooltip();
  }

  onClick = () => {
    if(this.props.onClick){
      this.props.onClick(this.props.data);
    }else if(this.props.link){
      if (typeof window !== 'undefined') {
        window.location = this.props.link;
      }
    }
  }

  render() {

    var group = '';
    if(this.props.group){
      group = (
        <div className="valign-wrapper" style={{position: 'absolute', bottom:1, left: 1}}>
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
      if(this.props.type === 'layer'){
        iconName = 'layers';
        toolTipText = this.__('Layer');
      }else if(this.props.type === 'group'){
        iconName = 'supervisor_account';
        toolTipText = this.__('Group');
      }else if(this.props.type === 'hub'){
        iconName = 'web';
        toolTipText = 'Hub';
      }else if(this.props.type === 'story'){
        iconName = 'library_books';
        toolTipText = this.__('Story');
        storyTag = (
          <div style={{position: 'absolute', bottom:1, left: 1, width: '200px'}}>
            <StoryHeader story={this.props.data} short/>
          </div>
        );
      }else if(this.props.type === 'map'){
        iconName = 'map';
        toolTipText = this.__('Map');
        if(!this.props.group){
          mapCardUserTag = (
          <div style={{position: 'absolute', bottom:1, left: 1, width: '200px'}}>
            <MapCardUserTag map={this.props.data} />
          </div>
        );
        }
        
      }

      typeIcon = (
        <i className="material-icons grey-text text-darken-3 card-tooltip"
          style={{position: 'absolute', bottom:1, right: 1}}
          data-position="bottom" data-delay="50" data-tooltip={toolTipText}>
          {iconName}
        </i>
      );
    }

    var privateIcon = '';
    if(this.props.private){
      privateIcon = (
        <div style={{position: 'absolute', top: '5px', right: '5px'}}>
        <i className="material-icons grey-text text-darken-3 card-tooltip"
        data-position="bottom" data-delay="50" data-tooltip={this.__('Private')}>
        lock</i>
        </div>
      );
    }

    var cardContents = (<div className="carousel-card small"></div>);
    if(this.state.mounted){
      var image = '';
      if(this.props.type === 'hub'){
        image = (
          <div className="card-image valign-wrapper" style={{borderBottom: '1px solid #757575', height: '150px'}}>
            <img className="responsive-img" style={{position: 'absolute', objectFit: 'cover', height: '150px'}} src={this.props.background_image_url} />
            <img className="valign" width="75" height="75" style={{position: 'relative',width: '75px', borderRadius: '15px', margin: 'auto'}}  src={this.props.image_url} />
          </div>
        );
      }else if(this.props.type === 'story' && !this.props.image_url){
        image = (
          <div className="card-image valign-wrapper" style={{borderBottom: '1px solid #757575', width: '200px', height: '150px'}}>
            <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px', margin: 'auto'}}>library_books</i>
          </div>
        );
      }else if(this.props.type === 'story' && this.props.image_url){
        image = (
          <div style={{height: '150px', width: '200px', backgroundImage: 'url('+ this.props.image_url +')', backgroundSize: 'cover', backgroundPosition: 'center'}} />
        );
      }else if(this.props.type === 'group' && !this.props.image_url){
        image = (
          <div className="card-image valign-wrapper" style={{borderBottom: '1px solid #757575', width: '200px', height: '150px'}}>
            <i className="material-icons omh-accent-text valign center-align" style={{fontSize: '80px', margin: 'auto'}}>supervisor_account</i>
          </div>
        );
      }else if(this.props.type === 'group' && this.props.image_url){
        image = (
          <div className="card-image" style={{borderBottom: '1px solid #757575'}}>
            <img  className="responsive-img" style={{height: '150px', width: 'auto', margin: 'auto'}} src={this.props.image_url} />
          </div>
        );
      }else{
        image = (
          <div className="card-image">
            <img width="200" height="150" style={{borderBottom: '1px solid #757575'}} src={this.props.image_url} />
          </div>
        );
      }
      cardContents = (  
        <div ref="card" className='hoverable margin5 small carousel-card card' onClick={this.onClick}>
          {image}
          {privateIcon}
        <div className="card-content no-padding word-wrap" style={{margin: '5px'}}>

          <b>{this.props.title}</b> <br />

          <p className="fade" style={{fontSize: '12px'}}> {this.props.description}</p>
            {mapCardUserTag}
            {storyTag}
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
}