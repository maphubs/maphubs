//@flow
import React from 'react';
var debug = require('../../services/debug')('FileUpload');
import FileUploadProgress from 'react-fileupload-progress';
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  action: string,
  onUpload: Function,
  onChange?: Function,
  onFinishTx: Function,
  onAbort?: Function,
  onError: Function,
  inputStyle: Object,
  style: Object
|}

type DefaultProps = {
  inputStyle: Object,
  style: Object
}

type State = {
  uploading?: boolean
}

export default class FileUpload extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps = {
      inputStyle: {
          visibility: 'hidden',
          width: '1px'
      },
      style: {
          display: 'inline-block'
      }
  }

  onProgress = (e: any, request: any, progress: number) => {
    debug("upload progress: " + progress);
    if (progress === 100){
      if(this.props.onFinishTx){
        this.props.onFinishTx();
      }
    }
  }

  onLoad =(e: any) => {
    var dataTxt = e.target.response;
    var data = JSON.parse(dataTxt);
    this.setState({uploading: false});
    this.props.onUpload(data);
  }

  onError = (e: any, request: any) => {
    if(this.props.onError) this.props.onError(e, request);
  }

  onAbort = (e: any, request: any) => {
    if(this.props.onAbort) this.props.onAbort(e, request);
  }

  formGetter = () => {
    let element: any = document.getElementById('customForm');
    if(element){
      let formElement: HTMLFormElement = ((element: any): HTMLFormElement);

      return new FormData(formElement);
    }
    
  }

  onClick = () => {
    this.refs.input.click();
  }

  customFormRenderer = (onSubmit: Function, onFileClick: Function) => {
    var _this = this;
    var onSubmitWrapper = function(val){
      if(_this.props.onChange){
        _this.props.onChange();
      }
      onSubmit(val);
    };
    let formRenderer = (
      <div className="col s12 m4 l3" onClick={onFileClick} style={this.props.style}>
      <form id='customForm' ref="form" method="post" style={{marginBottom: '15px'}}>
        <div className="row file-field input-field">
          <div className="col s12">

            <div className="btn">
              <span>{this.__('Choose File')}</span>
              <input type="file" name="file" style={this.props.inputStyle} ref='input' onChange={onSubmitWrapper} />
            </div>
          </div>
        </div>
      </form>
    </div>
    );
    return formRenderer;
  }

  customProgressRenderer = (progress: number, hasError: boolean, cancelHandler: Function) => {
     let progressRenderer;
    if (hasError || progress > -1 ) {
      let progressPct = progress + '%';

      let message = (<span>{progressPct}</span>);
      if (hasError) {
        message = (<span style={{'color': '#a94442'}}>{this.__('Failed to upload ...')}</span>);
      }
      if (progress === 100){
        message = (<span>{this.__('Done')}</span>);
      }

      progressRenderer = (
        <div className="col s12 m8 l9">
          <div className="progress col s10" style={{marginTop: '18px'}}>
              <div className="determinate" style={{width: progressPct}}></div>
          </div>
          <div className="col s2">
            <button className="btn-floating" onClick={cancelHandler}>
              <i className="material-icons">close</i>
            </button>
          </div>

          <div style={{'clear':'left', textAlign: 'center'}}>
            {message}
          </div>
        </div>
      );
    } else {
      progressRenderer = (<div></div>);
    }
    return progressRenderer;
  }

  render() {
      return (
            <FileUploadProgress key='omh' url={this.props.action}
              onProgress={this.onProgress}
              onLoad={this.onLoad}
              onError={this.onError}
              onAbort={this.onAbort}
              formGetter={this.formGetter}
              formRenderer={this.customFormRenderer}
              progressRenderer={this.customProgressRenderer}
      />
      );
    }
}