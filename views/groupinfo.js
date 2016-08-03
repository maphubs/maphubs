var React = require('react');

var Header = require('../components/header');
var slug = require('slug');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var GroupInfo = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

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

  render() {
    var _this = this;
    var addLayerButton = '';
    if(this.props.layers.length == 0){
      addLayerButton = (
        <div className="valign-wrapper">
          <a className="btn valign" style={{margin: 'auto'}} href="/createlayer">{this.__('Add a Layer')}</a>
        </div>
      );
    }

    var editButton = '';

    if(this.props.canEdit){
      editButton = (
        <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large omh-color">
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

    return (
      <div>
        <Header/>
        <div className="container">
          <h4>{this.props.group.name}</h4>
          <div className="row">
            <div className="col s6">
              <img  alt={this.__('Group Photo')} width="300" className="" src={'/group/' + this.props.group.group_id + '/image'}/>
            </div>
            <div className="col s6">
              <div className="row">
              <p><b>{this.__('Description: ')}</b>{this.props.group.description}</p>
              </div>
              {unofficial}
            </div>

          </div>

          <div>
            <ul className="collection with-header">
              <li className="collection-header">
                <h5>{this.__('Layers')}</h5>
              </li>
              {addLayerButton}
              {this.props.layers.map(function (layer, i) {
                return (<li className="collection-item" key={layer.layer_id}>
                    <div>{layer.name}
                      <a className="secondary-content" href={'/layer/map/' + layer.layer_id + '/' + slug(layer.name)}>
                        <i className="material-icons">map</i>
                      </a>
                      <a className="secondary-content" href={'/layer/info/' + layer.layer_id + '/' + slug(layer.name)}>
                        <i className="material-icons">info</i>
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
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
