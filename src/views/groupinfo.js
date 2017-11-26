//@flow
import React from 'react';
import Header from '../components/header';
import CardCarousel from '../components/CardCarousel/CardCarousel';
import cardUtil from '../services/card-util';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

import type {CardConfig} from '../components/CardCarousel/Card';
import type {Group} from '../stores/GroupStore';

type Props = {
  group: Group,
  maps: Array<Object>,
  layers: Array<Object>,
  hubs: Array<Object>,
  members: Array<Object>,
  canEdit: boolean,
  headerConfig: Object,
  locale: string,
  _csrf: string
}

type DefaultProps = {
  maps: Array<Object>,
  layers: Array<Object>,
  hubs: Array<Object>,
  members: Array<Object>,
  canEdit: boolean
}

type State = {
  mapCards: Array<CardConfig>,
  layerCards: Array<CardConfig>,
  hubCards: Array<CardConfig>
}

export default class GroupInfo extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    maps: [],
    layers: [],
    hubs: [],
    members: [],
    canEdit: false
  }

  constructor(props: Props){
		super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    this.state = {
      mapCards: this.props.maps.map(cardUtil.getMapCard),
      layerCards: this.props.layers.map(cardUtil.getLayerCard),
      hubCards: this.props.hubs.map(cardUtil.getHubCard)
    };
	}

  render() {
    var _this = this;
    let group_id = this.props.group.group_id? this.props.group.group_id : '';
    var editButton = '';

    if(this.props.canEdit){
      editButton = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large red red-text">
              <i className="large material-icons">more_vert</i>
            </a>
            <ul>
              <li>
                <a className="btn-floating tooltipped green" data-delay="50" data-position="left" data-tooltip={this.__('Add New Layer')}
                    href="/createlayer">
                  <i className="material-icons">add</i>
                </a>
              </li>
              <li>
                <a className="btn-floating tooltipped blue" href={'/group/' + group_id + '/admin'}data-delay="50" data-position="left" data-tooltip={this.__('Manage Group')}>
                  <i className="material-icons">settings</i>
                </a>
              </li>
            </ul>
        </div>
      );

      var addButtons = (
         <div className="valign-wrapper">
          <a className="btn valign" style={{margin: 'auto'}} href={'/map/new?group_id=' + group_id}>{this.__('Make a Map')}</a>
          <a className="btn valign" style={{margin: 'auto'}} href={'/createlayer?group_id=' + group_id}>{this.__('Add a Layer')}</a>
          <a className="btn valign" style={{margin: 'auto'}} href={'/createhub?group_id=' + group_id}>{this.__('Create a Hub')}</a>
        </div>
      );

    }

    var unofficial = '';
    if(this.props.group.unofficial){
      unofficial = (
        <div className="row">
          <p><b>{this.__('Unofficial Group')}</b> - {this.__('This group is maintained by Maphubs using public data and is not intended to represent the listed organization. If you represent this group and would like to take ownership please contact us.')}</p>
        </div>
      );
    }

    var descriptionWithLinks = '';

    if(this.props.group.description){
      let localizedDescription = this._o_(this.props.group.description);
      // regex for detecting links
      var regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig;
      descriptionWithLinks = localizedDescription.replace(regex, "<a href='$1' target='_blank' rel='noopener noreferrer'>$1</a>");
    }
    var status = this.__('DRAFT');
    if(this.props.group.published){
      status = this.__('Published');
    }

    var allCards = cardUtil.combineCards([this.state.mapCards, this.state.layerCards, this.state.hubCards]);

    return (
      <div>
        <Header {...this.props.headerConfig} />
        <div style={{marginLeft: '10px', marginRight: '10px'}}>
          <h4>{this._o_(this.props.group.name)}</h4>
          <div className="row">
            <div className="col s6">
              <img  alt={this.__('Group Photo')} width="300" className="" src={'/img/resize/600?url=/group/' + group_id + '/image'}/>
            </div>
            <div className="col s6">
              <div className="row">
              <p><b>{this.__('Description: ')}</b></p><div dangerouslySetInnerHTML={{__html: descriptionWithLinks}}></div>
              </div>
               <div className="row">
              <p><b>{this.__('Status: ')}</b>{status}</p>
              </div>
              <div className="row">
              <p><b>{this.__('Location: ')}</b>{this.props.group.location}</p>
              </div>
              {unofficial}
            </div>


          </div>
          <div className="divider" />
            <div className="row">              
               <div className="row">
                <CardCarousel cards={allCards} infinite={false}/>
              </div>
              {addButtons}
            </div>           
          </div>
          <div className="divider" />
          <div className="container">
          <div>
            <ul className="collection with-header">
              <li className="collection-header">
                <h5>{this.__('Members')}</h5>
              </li>
              {this.props.members.map(function (user, i) {
                var icon = '';
                if (user.role === 'Administrator') {
                  icon = (
                    <i className="secondary-content tooltipped material-icons"
                      data-delay="50" data-position="top" data-tooltip={_this.__('Group Administrator')}>
                      supervisor_account
                    </i>
                  );
                }
                var image = '';
                if(user.image){
                  image = (<img  alt={this.__('Profile Photo')} className="circle" src={user.image}/>);
                }else {
                  image = (<i className="material-icons circle">person</i>);
                }
                return (
                  <li className="collection-item avatar" key={user.id}>
                    {image}
                    <span className="title">{user.display_name}</span>
                    {icon}
                  </li>
                );
              })}
            </ul>
          </div>
          {editButton}
        </div>
      </div>
    );
  }
}