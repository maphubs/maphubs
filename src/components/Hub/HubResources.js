//@flow
import React from 'react';
import Editor from 'react-medium-editor';
import HubActions from '../../actions/HubActions';
import HubStore from '../../stores/HubStore';
import _isequal from 'lodash.isequal';
import MapHubsComponent from '../../components/MapHubsComponent';

type Props = {
  editing: boolean
}

import type {HubStoreState} from '../../stores/HubStore';

export default class HubResources extends MapHubsComponent<Props, Props, HubStoreState> {

  props: Props

  static defaultProps: Props = {
    editing: false
  }

  constructor(props: Props){
		super(props);
    this.stores.push(HubStore);
	}

  shouldComponentUpdate(nextProps: Props, nextState: HubStoreState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  handleResourcesChange = (resources: string) => {
    HubActions.setResources(resources);
  }

  render(){
    var resources = '';
    if(this.props.editing){
      resources = (
          <div className="row">
              <Editor
               className="hub-resources"
               text={this.state.hub.resources}
               onChange={this.handleResourcesChange}
               options={{
                 buttonLabels: 'fontawesome',
                 delay: 100,
                 placeholder: {text: this.__('Enter text, links to webpages, links to documents (from Dropbox, Google Docs, etc.)')},
                 buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'justifyLeft', 'justifyCenter', 'justifyRight', 'quote','orderedlist','unorderedlist', 'pre','removeFormat']
               }}
             />
          </div>

      );
    }else{
      /*eslint-disable react/no-danger*/
      resources = (
            <div className="resource-content col s12" dangerouslySetInnerHTML={{__html: this.state.hub.resources}}></div>
      );
      /*eslint-enable react/no-danger*/
    }

    return (
      <div className="row" style={{marginLeft: '0px'}}>
        {resources}
      </div>
    );
  }
}