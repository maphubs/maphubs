import React from 'react';
var debug = require('../../services/debug')('FileUpload');
import PropTypes from 'prop-types';

import FileUploadProgress from 'react-fileupload-progress';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var File = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    action: PropTypes.string,
    onUpload: PropTypes.func,
    onChange: PropTypes.func,
    onFinishTx: PropTypes.func,
    onAbort: PropTypes.func,
    onError: PropTypes.func,
    inputStyle: PropTypes.object,
    style: PropTypes.object
  },


  getDefaultProps() {
      return {
          inputStyle: {
              visibility: 'hidden',
              width: '1px'
          },
          style: {
              display: 'inline-block'
          }
      };
  },

  onProgress(e, request, progress){
    debug("upload progress: " + progress);
    if (progress === 100){
      if(this.props.onFinishTx){
        this.props.onFinishTx();
      }
    }
  },

  onLoad(e){
    var dataTxt = e.target.response;
    var data = JSON.parse(dataTxt);
    this.setState({uploading: false});
    this.props.onUpload(data);
  },

  onError(e, request){
    if(this.props.onError) this.props.onError(e, request);
  },

  onAbort(e, request){
    if(this.props.onAbort) this.props.onAbort(e, request);
  },

  formGetter(){
    return new FormData(document.getElementById('customForm'));
  },

  onClick(){
    this.input.click();
  },

  customFormRenderer(onSubmit, onFileClick){
    var _this = this;
    var onSubmitWrapper = function(val){
      if(_this.props.onChange){
        _this.props.onChange();
      }
      onSubmit(val);
    };
    return (
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
  },

  customProgressRenderer(progress, hasError, cancelHandler) {
    if (hasError || progress > -1 ) {
      let progressPct = progress + '%';

      let message = (<span>{progressPct}</span>);
      if (hasError) {
        message = (<span style={{'color': '#a94442'}}>{this.__('Failed to upload ...')}</span>);
      }
      if (progress === 100){
        message = (<span>{this.__('Done')}</span>);
      }

      return (
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
      return (<div></div>);
    }
  },

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
});

module.exports = File;
