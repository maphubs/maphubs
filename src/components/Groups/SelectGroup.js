var React = require('react');
var _isequal = require('lodash.isequal');

var Toggle = require('../forms/toggle');
var Select = require('../forms/select');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var SelectGroup = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    groups: React.PropTypes.array.isRequired,
    type: React.PropTypes.string.isRequired,
    group_id: React.PropTypes.string,
    canChangeGroup: React.PropTypes.bool,
    private: React.PropTypes.bool
  },

  getDefaultProps(){
    return  {
      canChangeGroup: true,
      private: true
    };
  },

  getInitialState(){
    return {
      group_id: this.props.group_id,
      private: this.props.private
    };
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.group_id !== this.props.group_id) {
      this.setState({group_id: nextProps.group_id});
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

  getOwnerGroup(group_id){
    var owner;
    this.props.groups.forEach(function(group){
      if(group.group_id === group_id){
        owner = group;
      }
    });
    return owner;
  },

  render(){

    var startEmpty = true;
    if(this.state.group_id){
      startEmpty = false;
    }
    var groups = '';
     if(this.props.groups.length > 1 && this.props.canChangeGroup){
      var groupOptions = [];

      this.props.groups.map(function(group){
        groupOptions.push({
          value: group.group_id,
          label: group.name
        });
      });

      groups = (
        <div>
          <p>{this.__('Since you are in multiple groups, please select the group that should own this item.')}</p>
          <Select name="group" id="layer-settings-select" label={this.__('Group')} startEmpty={startEmpty}
            value={this.state.group_id} defaultValue={this.state.group_id}
            emptyText={this.__('Choose a Group')} options={groupOptions} className="col s6"
              dataPosition="right" dataTooltip={this.__('Owned by Group')}
              required
              />
        </div>
        );

      }else{
        groups = (
          <div>
            <b>{this.__('Group:')} </b>{this.props.groups[0].name}
          </div>
        );
      }

      var privateToggle = '';

      if(this.state.group_id){
        var owner = this.getOwnerGroup(this.state.group_id);
        //check if allowed to have private content
        var privateAllowed = false;
        var overLimit = false;        
        if(owner.account.tier.tier_id !== 'public'){

          if(this.props.type === 'layer'){
            if(owner.account.tier.private_layer_limit > 0){
              privateAllowed = true;
              if((owner.account.numPrivateLayers + 1) >= owner.account.tier.private_layer_limit){
                overLimit = true;
              }
            }
          }else if(this.props.type === 'hub'){
            if(owner.account.tier.private_hub_limit > 0){
              privateAllowed = true;
              if((owner.account.numPrivateHubs + 1) >= owner.account.tier.private_hub_limit){
                overLimit = true;
              }
            }
          }else if(this.props.type === 'map'){
            if(owner.account.tier.private_map_limit > 0){
              privateAllowed = true;
              if((owner.account.numPrivateMaps + 1) >= owner.account.tier.private_map_limit){
                overLimit = true;
              }
            }
          } 
        }
        if(privateAllowed){
          var tooltipMessage = '';
          if(this.state.private){
            tooltipMessage = this.__('Only accessible to members of the same group');
          }else{
             tooltipMessage = this.__('Publicly Avaliable');
          }
           privateToggle = (
          <div className="row">
            <Toggle name="private" labelOff={this.__('Public')} labelOn={this.__('Private')} defaultChecked={this.state.private} className="col s4"
                dataPosition="right" dataTooltip={tooltipMessage}
              />
          </div>
        );
        }
        
      }

     
      

    return (
      <div>
      {groups}
      {privateToggle}
      </div>
    );
  }

});

module.exports = SelectGroup;