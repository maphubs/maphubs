//@flow
import React from 'react';
import {Modal, ModalContent, ModalFooter} from '../Modal/Modal.js';
import MapHubsComponent from '../MapHubsComponent';
import DataCollectionForm from '../DataCollection/DataCollectionForm';
import MessageActions from '../../actions/MessageActions';
var request = require('superagent');
var checkClientError = require('../../services/client-error-response').checkClientError;
var debug = require('../../services/debug')('EditAttributeModal');
var _assignIn = require('lodash.assignin');

type Props = {
  feature: Object,
  presets: Array<Object>,
  layer_id: number,
  onSave: Function
}

type State = {
  show: boolean,
  values: Object
}

export default class EditAttributesModal extends MapHubsComponent<void, Props, State> {

  constructor(props: Props){
    super(props);
    let values = props.feature ? props.feature.properties : {};
    this.state = {
      values
    };
  }

  componentWillReceiveProps(nextProps: Object){
    if(!this.props.feature && nextProps.feature){
      this.setState({values: nextProps.feature.properties});
    }
  }

  /**
   * Show the Modal
   */
  show = () => {
    this.setState({show: true});
  }

   close = () => {
    this.setState({show: false});
  }

  onChange = (data: Object) => {
     _assignIn(this.state.values, data);
  }

  /**
   * Save data to server
   */
  onSave = () => {
    var _this = this;

    let feature = this.props.feature; 
     _assignIn(feature.properties, this.state.values);
    feature.id = feature.properties.mhid;

    let edits = [
      {
        status: 'modify',
        geojson: feature
      }
    ];

    request.post('/api/edits/save')
    .type('json').accept('json')
    .send({
        layer_id: this.props.layer_id,
        edits,
        _csrf: this.state._csrf
    })
    .end((err, res) => {
      checkClientError(res, err, ()=>{}, () => {       
        if(err){
          //show error message  
          debug(err);
          MessageActions.showMessage({title: 'Error', message: err});  
          if(this.props.onSave){
            this.props.onSave();
          } 
        }else{
          _this.setState({show: false});
        }      
      });
    });
  }

  render(){
    return (
      <Modal show={this.state.show} className="edit-attributes-modal" dismissible={false} fixedFooter={true}>
        <ModalContent style={{padding: 0, margin: 0, height: 'calc(100% - 35px)', overflow: 'hidden'}}>
          <div className="row no-margin" style={{height: '35px'}}>
            <a className="omh-color" style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
              <i className="material-icons selected-feature-close" style={{fontSize: '35px'}}>close</i>
            </a>
          </div>
          <div className="row no-margin" style={{height: 'calc(100% - 35px)', overflow: 'auto', padding: '10px'}}>
            <DataCollectionForm presets={this.props.presets} 
              values={this.state.values}
              onChange={this.onChange}
              showSubmit={false} />
          </div>
        </ModalContent>
        <ModalFooter style={{height: '35px'}}>
          <button className="btn" onClick={this.onSave}>{this.__('Save')}</button>
        </ModalFooter>
      </Modal>
    );
  }

}