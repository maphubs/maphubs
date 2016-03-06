var React = require('react');
var debug = require('../services/debug')('ImageCrop');
import {Modal, ModalContent} from './Modal/Modal.js';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var ImageCrop = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    onCrop: React.PropTypes.func,
    lockAspect:  React.PropTypes.bool,
    aspectRatio: React.PropTypes.number,
    autoCropArea: React.PropTypes.number
  },

  getDefaultProps(){
    return {
        lockAspect: false,
        aspectRatio: NaN,
        autoCropArea: 0.95
    };
  },

  getInitialState() {
    return {
      src: null,
      show: false,
      preview: null,
      autoCropArea: this.props.autoCropArea,
      aspectRatio: this.props.aspectRatio
    };
  },

  componentWillReceiveProps(nextProps) {
    var updateProps = {}
    if(nextProps.aspectRatio) {
      debug('update aspectratio to: ' + nextProps.aspectRatio);
      updateProps.aspectRatio = nextProps.aspectRatio;
    }
    if(nextProps.autoCropArea) {
      debug('update autoCropArea to: ' + nextProps.autoCropArea);
      updateProps.autoCropArea = nextProps.autoCropArea;
    }
    this.setState(updateProps);
  },

  show(){
    this.setState({show: true});
  },

  _crop(){
    /*
    var cropper = this.refs.cropper;
    var canvas = cropper.getCroppedCanvas();
    var dataURL = canvas.toDataURL();
    this.setState({
      preview: dataURL
    });
    */

  },

  onSave(){
    var cropper = this.refs.cropper;
    var canvas = cropper.getCroppedCanvas();
    var dataURL = canvas.toDataURL();
    this.setState({show: false});
    if(this.props.onCrop) this.props.onCrop(dataURL);
    this.resetImageCrop();
  },

  _onChange(e){
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    let reader = new FileReader();
    reader.onload = () => {
      this.setState({src: reader.result});
    };
    reader.readAsDataURL(files[0]);
  },


  handleCloseSelected(){
    this.resetImageCrop();
    this.setState({show: false});
  },

  zoomIn(){
    this.refs.cropper.zoom(0.1);
  },

  zoomOut(){
    this.refs.cropper.zoom(-0.1);
  },

   cropOriginal(){
    this.resetCropPosition();
    this.setState({autoCropArea: 1, aspectRatio: NaN});
  },

  aspect16by9(){
    this.setState({aspectRatio: 16 / 9});
  },

  aspect3by2(){
    this.setState({aspectRatio: 3 / 2});
  },

  aspectSquare(){
    this.setState({aspectRatio: 1 / 1});
  },

  resetCropPosition(){
    this.setState({
      autoCropArea: 1,
      aspectRatio: NaN
    });
    this.refs.cropper.reset();

  },

  resetImageCrop(){
    if(this.refs.cropper && this.refs.cropper.reset) this.refs.cropper.reset();
    this.setState({src: null, selectedFile: null});
  },

  render(){

    var cropper = '';
    if (typeof window !== 'undefined') {
      var Cropper = require('react-cropper');
      if(this.state.src){
        cropper = (
          <Cropper
            style={{height: 'calc(100% - 10px)', paddingBottom: '10px', width: '100%'}}
            autoCropArea={this.state.autoCropArea}
            aspectRatio={this.state.aspectRatio}
            guides={false}
            src={this.state.src}
            ref='cropper'
            crop={this._crop} />
        );
      } else {
          cropper = (
            <div><p>Choose an image file</p></div>
          );
      }

    }

    var toolButtons = '', saveButton = '', cropOriginalBtn = '', crop16by9Btn = '', crop3by2Btn = '', cropSquareBtn = '';
    if(this.state.src){
      if(!this.props.lockAspect){
        cropOriginalBtn = (
          <a className="btn-floating btn waves-effect waves-light" onClick={this.cropOriginal}><i className="material-icons omh-accent-text">crop_original</i></a>
        );
        crop16by9Btn = (
          <a className="btn-floating btn waves-effect waves-light" onClick={this.aspect16by9}><i className="material-icons omh-accent-text">crop_16_9</i></a>
        );
        crop3by2Btn = (
          <a className="btn-floating btn waves-effect waves-light" onClick={this.aspect3by2}><i className="material-icons omh-accent-text">crop_3_2</i></a>
        );
        cropSquareBtn = (
          <a className="btn-floating btn waves-effect waves-light" onClick={this.aspectSquare}><i className="material-icons omh-accent-text">crop_square</i></a>
        );
      }

      toolButtons = (
        <div className='col s12'>
            <a className="btn-floating btn waves-effect waves-light" onClick={this.zoomIn}><i className="material-icons omh-accent-text">zoom_in</i></a>
            <a className="btn-floating btn waves-effect waves-light" onClick={this.zoomOut}><i className="material-icons omh-accent-text">zoom_out</i></a>
            {cropOriginalBtn}{crop16by9Btn}{crop3by2Btn}{cropSquareBtn}
            <a className="btn-floating btn waves-effect waves-light" onClick={this.reset}><i className="material-icons omh-accent-text">restore</i></a>
        </div>
      );

      saveButton = (
        <div className="fixed-action-btn action-button-bottom-right tooltipped" data-position="top" data-delay="50" data-tooltip={this.__('Save Map')}>
          <a onMouseDown={this.onSave} className="btn-floating btn-large omh-color">
            <i className="large material-icons">save</i>
          </a>
        </div>
      );
    }
    return (
      <Modal show={this.state.show} id="image-crop-modal" className="image-crop-modal" style={{overflow: 'hidden'}} dismissible={false} fixedFooter={false}>
        <ModalContent style={{padding: 0, margin: 0, height: '100%', overflow: 'hidden'}}>
          <a className="omh-color" style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}}>
            <i className="material-icons selected-feature-close" onClick={this.handleCloseSelected}>close</i>
          </a>
          <div className='row no-margin no-padding' style={{height: '80px'}}>
            <div className='col s12'>
              <div className="file-field input-field">
                <div className="btn">
                  <span>{this.__('Choose File')}</span>
                  <input type="file" onChange={this._onChange} value={this.state.selectedFile}/>
                </div>
                <div className="file-path-wrapper">
                  <input className="file-path validate" type="text" value={this.state.selectedFile} />
                </div>
              </div>

            </div>
          </div>
          <div className='row no-margin no-padding' style={{height: '50px'}}>
            {toolButtons}
          </div>
        <div className='row' style={{height: 'calc(100% - 130px)'}}>
        <div className='col s12' style={{height: '100%'}}>
          {cropper}
        </div>
        <br style={{clear: 'both'}}/>
          {saveButton}
      </div>

        </ModalContent>
      </Modal>
      );
  }

});

module.exports = ImageCrop;
