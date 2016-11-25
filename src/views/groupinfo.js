var React = require('react');

var Header = require('../components/header');
var CardCarousel = require('../components/CardCarousel/CardCarousel');
var cardUtil = require('../services/card-util');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var GroupInfo = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    group: React.PropTypes.object,
    layers: React.PropTypes.array,
    members: React.PropTypes.array,
    canEdit: React.PropTypes.bool,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      group: {
        name: "Unknown"
      },
      layers: [],
      members: [],
      canEdit: false
    };
  },

  getInitialState(){
    return {
      layerCards: this.props.layers.map(cardUtil.getLayerCard)
    };
  },

  render() {
    var _this = this;

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
                <a className="btn-floating tooltipped blue" href={'/group/' + this.props.group.group_id + '/admin'}data-delay="50" data-position="left" data-tooltip={this.__('Manage Group')}>
                  <i className="material-icons">settings</i>
                </a>
              </li>
            </ul>
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
      // regex for detecting links
      var regex = /(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig;
      descriptionWithLinks = this.props.group.description.replace(regex, "<a href='$1' target='_blank'>$1</a>");
    }
    var status = this.__('DRAFT');
    if(this.props.group.published){
      status = this.__('Published');
    }


    return (
      <div>
        <Header/>
        <div style={{marginLeft: '10px', marginRight: '10px'}}>
          <h4>{this.props.group.name}</h4>
          <div className="row">
            <div className="col s6">
              <img  alt={this.__('Group Photo')} width="300" className="" src={'/group/' + this.props.group.group_id + '/image'}/>
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
              <h5 className="no-margin" style={{lineHeight: '50px'}}>{this.__('Layers')}</h5>
              <div className="row">
                <CardCarousel cards={this.state.layerCards} infinite={false}/>
              </div>
              <div className="valign-wrapper">
                <a className="btn valign" style={{margin: 'auto'}} href={'/createlayer?group_id=' + this.props.group.group_id}>{this.__('Add a Layer')}</a>
              </div>
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
                if (user.role == 'Administrator') {
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
});

module.exports = GroupInfo;
