//@flow
import React from 'react';
import {HOC} from 'formsy-react';
import classNames from 'classnames';
import FileUpload from '../forms/FileUpload';
var debug = require('../../services/debug')('DataUpload');
import MapHubsComponent from '../MapHubsComponent';

class DataUpload extends MapHubsComponent {
  
  props: {
    layerId: string,
    className: string,
    dataTooltip: string,
    dataDelay: number,
    dataPosition: string
  }

  static defaultProps = {
    layerId: null
  }

  state = {
    value: ''
  }

  changeValue = (event) => {
     this.setValue(event.currentTarget.value);
     this.setState({value: event.currentTarget.value});
   }

   onUpload = (e) => {
     debug(e);
   }

  render() {
     var className = classNames( this.props.className, {tooltipped: this.props.dataTooltip ? true : false});
     var url = "/api/layer/1/upload/shapefile";

    return (
      <div className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition} data-tooltip={this.props.dataTooltip}>
           <FileUpload onMessage={this.onUpload} action={url}>
             <button type="submit" className="waves-effect waves-light btn">{this.__('Upload')}</button>
           </FileUpload>
      </div>
    );
  }
}
export default HOC(DataUpload);