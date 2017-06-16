//@flow
import React from 'react';
import _isequal from 'lodash.isequal';
import Toggle from '../forms/toggle';
import Select from '../forms/select';
import MapHubsComponent from '../../components/MapHubsComponent';

import type {Group} from '../../stores/GroupStore';

type Props = {
    groups: Array<Group>,
    type: string,
    group_id?: string,
    canChangeGroup: boolean,
    private: boolean,
    editing: boolean
};

type DefaultProps = {
  canChangeGroup: boolean,
  private: boolean,
  editing: boolean
}

type State = {
  group_id?: string,
  private: boolean
}

export default class SelectGroup extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps = {
    canChangeGroup: true,
    private: true,
    editing: false
  }

  constructor(props: Props){
		super(props);
    this.state = {
      group_id: this.props.group_id,
      private: this.props.private
    };
	}

  componentWillReceiveProps(nextProps: Props){
    if(nextProps.group_id !== this.props.group_id) {
      this.setState({group_id: nextProps.group_id});
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  getOwnerGroup = (group_id: string): Object => {
    var owner = {};
    this.props.groups.forEach((group) => {
      if(group.group_id === group_id){
        owner = group;
      }
    });
    return owner;
  }

  onGroupChange = (group_id: string) => {
    this.setState({group_id});
  }

  render(){

    var startEmpty = true;
    var owner;
    if(this.state.group_id){
      startEmpty = false;
    }
    var groups = '';
     if(this.props.groups.length > 1 && this.props.canChangeGroup){
      var groupOptions = [];
      var _this = this;
      this.props.groups.map((group) => {
        groupOptions.push({
          value: group.group_id,
          label: _this._o_(group.name)
        });
      });

      groups = (
        <div className="row">
          <p style={{padding: '10px'}}>{this.__('Since you are in multiple groups, please select the group that should own this item.')}</p>
          <Select name="group" id="layer-settings-select" label={this.__('Group')} startEmpty={startEmpty}
            value={this.state.group_id} onChange={this.onGroupChange}
            emptyText={this.__('Choose a Group')} options={groupOptions} className="col s12"
              dataPosition="right" dataTooltip={this.__('Owned by Group')}
              required
              />
        </div>
        );

      }else if(this.state.group_id){
        owner = this.getOwnerGroup(this.state.group_id);
        groups = (
          <div className="row">
            <b>{this.__('Group:')} </b>{this._o_(owner.name)}
          </div>
        );

      }else{
        groups = (
          <div className="row">
            <b>{this.__('Group:')} </b>{this._o_(this.props.groups[0].name)}
          </div>
        );
      }

      var privateToggle = '';

      if(this.state.group_id){
        //check if allowed to have private content
        owner = this.getOwnerGroup(this.state.group_id);
        var privateAllowed = false;
        var overLimit = false;        
        var itemCount, itemLimit, itemName;
        if(owner.account.tier.tier_id !== 'public'){

          if(this.props.type === 'layer'){
            if(owner.account.tier.private_layer_limit > 0){
              privateAllowed = true;
              itemCount = owner.account.numPrivateLayers;
              itemLimit = owner.account.tier.private_layer_limit;
              if((itemCount + 1) > itemLimit){
                overLimit = true;
              }
              itemName = this.__('private layers');
            }
          }else if(this.props.type === 'hub'){
            if(owner.account.tier.private_hub_limit > 0){
              privateAllowed = true;
              itemCount = owner.account.numPrivateHubs;
              itemLimit = owner.account.tier.private_hub_limit;
              if((itemCount + 1) > itemLimit){
                overLimit = true;
              }
              itemName = this.__('private hubs');
            }
          }else if(this.props.type === 'map'){
            if(owner.account.tier.private_map_limit > 0){
              privateAllowed = true;
              itemCount = owner.account.numPrivateMaps;
              itemLimit = owner.account.tier.private_map_limit;
              if((itemCount + 1) > itemLimit){
                overLimit = true;
              }
              itemName = this.__('private maps');
            }
          } 
        }
        if(privateAllowed){
          var tooltipMessage = this.__('Private layers are only accessible to members of the same group');
          
          var checked = false;
          var disablePrivate = false;
          var overLimitMessage = '';
          if(overLimit){
            disablePrivate = true;
            //keep previous settings even if over the limit
            if(this.props.editing){
              checked = this.state.private;
            }else{
              overLimitMessage = (
                <p>{this.__('Upgrade your account to add additional ')} {itemName}</p>
              );
            }
          }else{           
            checked = this.state.private;
          }
         
          privateToggle = (
            <div className="row">
              <p style={{padding: '10px'}}>{this.__('Account Level:')} <b>{owner.account.tier.name}</b>&nbsp;
                <span>
                  {this.__('You are currently using ')} {itemCount} {this.__('of')} {itemLimit} {itemName}
                </span>
              </p>
              <Toggle name="private" labelOff={this.__('Public')} disabled={disablePrivate} labelOn={this.__('Private')} checked={checked} className="col s12"
                  dataPosition="right" dataTooltip={tooltipMessage}
                />
              {overLimitMessage}
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
}