//@flow
import React from 'react';
import Editor from 'react-medium-editor';
import HubStore from '../../stores/HubStore';
import HubActions from '../../actions/HubActions';
var _isequal = require('lodash.isequal');
import MapHubsComponent from '../../components/MapHubsComponent';

export default class HubDescription extends MapHubsComponent {

  props: {
    hubid: string,
    editing: boolean,
    subPage: boolean
  }

  static defaultProps = {
    editing: false,
    subPage: false
  }

  constructor(props: Object){
		super(props);
    this.stores.push(HubStore);
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

  handleDescriptionChange(desc: string){
    HubActions.setDescription(desc);
  }

  render() {   
    var description = '';
    var descriptionVal = null;
    if (this.state.hub.description) descriptionVal = this.state.hub.description.replace('&nbsp;', '');
    if(this.props.editing){      
      description = (
        <div className="container">
          <div className="row">
            <div className="flow-text">
              <Editor
               tag="p"
               text={descriptionVal}
               onChange={this.handleDescriptionChange.bind(this)}
               options={{toolbar: false, buttonLabels: false,
                 placeholder: {text: this.__('Enter a Description or Intro for Your Hub')},
                 disableReturn: true, buttons: []}}
             />
            </div>
          </div>
        </div>
      );
    }else{  
      description = (
        <div className="container">
          <div className="row">
            <p className="flow-text hub-description">{descriptionVal}</p>
          </div>
        </div>
      );
    }

    if(this.props.subPage){
      description = '';
    }

    return (
      <div>      
        {description}
      </div>
    );
  }
}