var React = require('react');
var debug = require('../services/debug')('ImageCrop');
import {Modal, ModalContent} from './Modal/Modal.js';
var Promise = require('bluebird');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var MessageActions = require('../actions/MessageActions');

var EXIF = require('exif-js');

var ImageCrop = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    onCrop: React.PropTypes.func,
    lockAspect:  React.PropTypes.bool,
    aspectRatio: React.PropTypes.number,
    autoCropArea: React.PropTypes.number,
    allowedExtensions: React.PropTypes.array,
    max_size: React.PropTypes.number,
    skip_size: React.PropTypes.number,
    jpeg_quality: React.PropTypes.number,
    resize_height: React.PropTypes.number,
    resize_max_height: React.PropTypes.number,
    resize_width: React.PropTypes.number,
    resize_max_width: React.PropTypes.number
  },

  getDefaultProps(){
    return {
        lockAspect: false,
        aspectRatio: NaN,
        autoCropArea: 0.95,
        allowedExtensions: ['jpg', 'jpeg', 'png'],
        max_size: 5242880, //5MB
        skip_size: 10000, //10kb
        jpeg_quality: 75,
        resize_height: null,
        resize_max_height: null,
        resize_width: 800,
        resize_max_width: null

    };
  },

  getInitialState() {
    return {
      img: null,
      file: null,
      show: false,
      preview: null,
      autoCropArea: this.props.autoCropArea,
      aspectRatio: this.props.aspectRatio
    };
  },

  componentWillReceiveProps(nextProps) {
    var updateProps = {};
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



    checkFile(file) {
     let allowedFileExt = new RegExp('\.(' + this.props.allowedExtensions.join('|') + ')$', 'i');
     let message;

     if (!allowedFileExt.test(file.name)) {
       message = 'Unsupported File Extension: ' + file.name;

       return new Error(message);
     }
   },

    checkFileSize(file) {
      var _this = this;
      return new Promise(function(fulfill, reject){
        let maxSize =  _this.props.max_size;
        let message;

        if (file.size > maxSize) {
          message = _this.__('Maximum Size Exceeded:') + ' ' +  Math.round(maxSize / 1024);
          debug(message);
          return reject(new Error(message));
        }

        return fulfill();
      });
    },


resizeImage(sourceCanvas){
  var pica = null;
  if (typeof window === 'undefined') {
    return;
  }else{
    //pica = require('pica');
    pica = require("../node_modules/pica/dist/pica.min.js");
    //require('pica/lib/webgl/fsh-lanczos-1d-covolve-horizontal.frag');
    //require('pica/lib/webgl/fsh-lanczos-1d-covolve-vertical.frag');
    //require('pica/lib/webgl/vsh-basic.vert');
  }

  var _this = this;
  return new Promise(function(fulfill, reject){


  // If image size smaller than 'skip_size' - skip resizing
  if (_this.state.file.size < _this.props.skip_size) {
    let data = sourceCanvas.toDataURL(_this.state.file.type, quality);
    fulfill(data);
    return;
  }

  let scaledHeight, scaledWidth;


  let resize_height = _this.props.resize_height;
  let resize_width = _this.props.resize_width;
  let resize_max_height = _this.props.resize_max_height;
  let resize_max_width = _this.props.resize_max_width;


  if (resize_height && !resize_width) {
    // If only height defined - scale to fit height,
    // and crop by max_width
    scaledHeight = resize_height;

    let proportionalWidth = Math.floor(_this.state.cropWidth * scaledHeight / _this.state.cropHeight);

    scaledWidth = (!resize_max_width || resize_max_width > proportionalWidth) ? proportionalWidth : resize_max_width;

  } else if (!resize_height && resize_width) {
    // If only width defined - scale to fit width,
    // and crop by max_height
    scaledWidth = resize_width;

    let proportionalHeight = Math.floor(_this.state.cropHeight * scaledWidth / _this.state.cropWidth);

    scaledHeight = (!resize_max_height || resize_max_height > proportionalHeight) ? proportionalHeight : resize_max_height;

  } else if(resize_height && resize_width) {
    // If determine both width and height
    scaledWidth = resize_width;
    scaledHeight = resize_height;

  } else if(!resize_width && resize_max_width){

    //force a maximum, but allow any dimensions less than, unlike the options above this is not garunteed to return a specific width

    if(_this.state.cropWidth > resize_max_width){
      scaledWidth = resize_max_width;
      let proportionalHeight = Math.floor(_this.state.cropHeight * scaledWidth / _this.state.cropWidth);
      scaledHeight = (!resize_max_height || resize_max_height > proportionalHeight) ? proportionalHeight : resize_max_height;
    }else{
      //no need to resize
      let data = sourceCanvas.toDataURL(_this.state.file.type, quality);
      fulfill(data);
      return;
    }

  }

  let quality = _this.props.jpeg_quality;

  let alpha = _this.state.ext === 'png';

  let dest = document.createElement('canvas');

  dest.width = scaledWidth;
  dest.height = scaledHeight;

  pica.resizeCanvas(sourceCanvas, dest, {alpha}, function (err){
    if(err){
      reject(err);
    }
    var data = dest.toDataURL(_this.state.file.type, quality);
    fulfill(data);
  });

  });

},

  _onChange(e){
    var _this = this;
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }

    var file = files [0];

    //check if file is supported
    let err = this.checkFile(file);
    if (err){
      debug(err);
      MessageActions.showMessage({title: 'Error', message: err});
      return;
    }

    this.checkFileSize(file)
    .then(function(){
      //read the file
      let img = new Image();

      img.onload = () => {
        //get the original size
        var width = img.width;
        var height = img.height;
        //save exif data and image to state
        EXIF.getData(img, function() {
          var exifdata = img.exifdata;

          let tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;


          if(exifdata.Orientation && exifdata.Orientation !== 1){
            //transfrom the canvas
            var ctx = tempCanvas.getContext('2d');
            switch(exifdata.Orientation){
              case 1:
                ctx.transform(1, 0, 0, 1, 0, 0);
                break;
              case 2:
                ctx.transform(-1, 0, 0, 1, width, 0);
                break;
              case 3:
                ctx.transform(-1, 0, 0, -1, width, height );
                break;
              case 4:
                ctx.transform(1, 0, 0, -1, 0, height );
                break;
              case 5:
                //swap width/height
                tempCanvas.width = height;
                tempCanvas.height = width;
                ctx.transform(0, 1, 1, 0, 0, 0);
                break;
              case 6:
                //swap width/height
                tempCanvas.width = height;
                tempCanvas.height = width;
                ctx.transform(0, 1, -1, 0, height , 0);
                break;
              case 7:
                //swap width/height
                tempCanvas.width = height;
                tempCanvas.height = width;
                ctx.transform(0, -1, -1, 0, height , width);
                break;
              case 8:
                //swap width/height
                tempCanvas.width = height;
                tempCanvas.height = width;
                ctx.transform(0, -1, 1, 0, 0, width);
                break;
            }
          }
          tempCanvas.getContext('2d').drawImage(img, 0, 0,  img.width, img.height);
          var data = tempCanvas.toDataURL(file.type, 1);
          _this.setState({src: data, exif: exifdata, file, img});

          /*
             let reader = new FileReader();
            reader.onload = () => {
              _this.setState({src: reader.result, exif: exifdata, file, img, origImgWidth, origImgHeight});

            };
            reader.readAsDataURL(files[0]);
            */
         });
      };

      img.onerror = () => {
        let message = _this.__('Bad Image:') + ' ' + file.name;
        debug(message);
        MessageActions.showMessage({title: 'Error', message});
      };

      img.src = window.URL.createObjectURL(file);
    }).catch(function(err){
      debug(err);
        MessageActions.showMessage({title: 'Error', message: err});
    });

  },

  _crop(e){

    this.setState({
      cropWidth: e.width,
      cropHeight: e.height,
      cropScaleX: e.scaleX,
      cropScaleY: e.scaleY
    });

 },

  onSave(){
    var _this = this;
    var cropper = this.refs.cropper;
    var canvas = cropper.getCroppedCanvas();

    //resize the image
    this.resizeImage(canvas).then(function(dataURL){
      _this.setState({show: false});
      if(_this.props.onCrop) _this.props.onCrop(dataURL, _this.state.exif);
      _this.resetImageCrop();

    }).catch(function(err){
      debug(err);
        MessageActions.showMessage({title: 'Error', message: err});
    });
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
            <div className="valign-wrapper" style={{height: '75%'}}>
              <h5 className="center-align valign" style={{margin: 'auto'}}>{this.__('Choose an image file')}</h5>
            </div>
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
