// @flow
import React from 'react'
import MapHubsComponent from './MapHubsComponent'
import {Modal, ModalContent} from './Modal/Modal.js'
import Promise from 'bluebird'
import MessageActions from '../actions/MessageActions'
import {Tooltip} from 'react-tippy'
import 'cropperjs/dist/cropper.css'
import $ from 'jquery'
// import Cropper from 'react-cropper';

import EXIF from 'exif-js'
import DebugService from '../services/debug'
const debug = DebugService('ImageCrop')

type Props = {
  onCrop: Function,
  lockAspect: boolean,
  aspectRatio?: number,
  autoCropArea: number,
  allowedExtensions: Array<string>,
  max_size: number,
  skip_size: number,
  jpeg_quality: number,
  resize_height?: number,
  resize_max_height?: number,
  resize_width?: number,
  resize_max_width?: number
}

type File = {
  size: number,
  type: string
}

type State = {
  img: ?Object,
  file: ?File,
  show: boolean,
  preview: ?Object,
  loading: boolean,
  autoCropArea: number,
  aspectRatio: number,
  cropWidth: number,
  cropHeight: number,
  cropScaleX?: number,
  cropScaleY?: number,
  selectedFile: ?string,
  exif: Object,
  ext?: string,
  src?: any
}

export default class ImageCrop extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    lockAspect: false,
    autoCropArea: 1,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    max_size: 5242880, // 5MB
    skip_size: 10000, // 10kb
    jpeg_quality: 75
  }

  state: State = {
    img: null,
    file: {size: 0, type: ''},
    show: false,
    preview: null,
    loading: false,
    autoCropArea: 1,
    aspectRatio: 1,
    cropWidth: 0,
    cropHeight: 0,
    selectedFile: '',
    exif: {}
  }

  constructor (props: Props) {
    super(props)
    this.state.autoCropArea = props.autoCropArea
    if (props.aspectRatio) {
      this.state.aspectRatio = props.aspectRatio
    }
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.refs.saveButton, {})
  }

  componentWillReceiveProps (nextProps: Props) {
    const updateProps = {}
    if (nextProps.aspectRatio) {
      debug.log('update aspectratio to: ' + nextProps.aspectRatio)
      updateProps.aspectRatio = nextProps.aspectRatio
    }
    if (nextProps.autoCropArea) {
      debug.log('update autoCropArea to: ' + nextProps.autoCropArea)
      updateProps.autoCropArea = nextProps.autoCropArea
    }
    this.setState(updateProps)
  }

  show = () => {
    this.setState({show: true})
  }

  checkFile = (file: Object) => {
    const allowedFileExt = new RegExp('\.(' + this.props.allowedExtensions.join('|') + ')$', 'i')
    let message

    if (!allowedFileExt.test(file.name)) {
      message = 'Unsupported File Extension: ' + file.name

      return new Error(message)
    }
  }

  checkFileSize = (file: Object) => {
    const {t} = this
    const _this = this
    return new Promise((resolve, reject) => {
      const maxSize = _this.props.max_size
      let message

      if (file.size > maxSize) {
        message = t('Maximum Size Exceeded:') + ' ' + Math.round(maxSize / 1024)
        debug.log(message)
        return reject(new Error(message))
      }

      return resolve()
    })
  }

resizeImage = (sourceCanvas: any): Promise<Object> => {
  let pica = null
  if (typeof window === 'undefined') {
    return new Promise((resolve) => {
      resolve()
    })
  } else {
    pica = require('../../node_modules/pica/dist/pica.min.js')()
  }

  const _this = this
  return new Promise((resolve, reject) => {
  // If image size smaller than 'skip_size' - skip resizing
    if (_this.state.file && _this.state.file.size < _this.props.skip_size) {
      const data = sourceCanvas.toDataURL(_this.state.file.type)
      resolve(data)
      return
    }

    let scaledHeight: number, scaledWidth: number

    const resize_height = _this.props.resize_height
    const resize_width = _this.props.resize_width
    const resize_max_height: number = _this.props.resize_max_height
    const resize_max_width: number = _this.props.resize_max_width

    if (resize_height && !resize_width) {
    // If only height defined - scale to fit height,
    // and crop by max_width
      scaledHeight = resize_height

      const proportionalWidth: number = Math.floor(_this.state.cropWidth * scaledHeight / _this.state.cropHeight)

      scaledWidth = (!resize_max_width || resize_max_width > proportionalWidth) ? proportionalWidth : resize_max_width
    } else if (!resize_height && resize_width) {
    // If only width defined - scale to fit width,
    // and crop by max_height
      scaledWidth = resize_width

      const proportionalHeight: number = Math.floor(_this.state.cropHeight * scaledWidth / _this.state.cropWidth)

      scaledHeight = (!resize_max_height || resize_max_height > proportionalHeight) ? proportionalHeight : resize_max_height
    } else if (resize_height && resize_width) {
    // If determine both width and height
      scaledWidth = resize_width
      scaledHeight = resize_height
    } else if (!resize_width && resize_max_width) {
    // force a maximum, but allow any dimensions less than, unlike the options above this is not garunteed to return a specific width

      if (_this.state.cropWidth > resize_max_width) {
        scaledWidth = resize_max_width
        const proportionalHeight = Math.floor(_this.state.cropHeight * scaledWidth / _this.state.cropWidth)
        scaledHeight = (!resize_max_height || resize_max_height > proportionalHeight) ? proportionalHeight : resize_max_height
      } else {
      // no need to resize
        if (_this.state.file) {
          const data = sourceCanvas.toDataURL(_this.state.file.type)
          resolve(data)
        } else {
          throw new Error('missing file')
        }
        return
      }
    }

    const quality = _this.props.jpeg_quality

    const alpha = _this.state.ext === 'png'

    const dest = document.createElement('canvas')

    dest.width = scaledWidth
    dest.height = scaledHeight
    if (pica) {
      return pica.resize(sourceCanvas, dest, {
        alpha,
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2
      })
        .then(result => {
          if (_this.state.file) {
            const data = result.toDataURL(_this.state.file.type, quality)
            return resolve(data)
          } else {
            throw new Error('missing file')
          }
        }).catch(err => {
          reject(err)
        })
      /*
    pica.resizeCanvas(sourceCanvas, dest, {alpha}, (err) => {
    if(err){
      reject(err);
    }
    var data = dest.toDataURL(_this.state.file.type, quality);
    fulfill(data);
  });
  */
    }
  })
}

  _onChange = (e: any) => {
    const {t} = this
    const _this = this
    _this.setState({loading: true})
    let files: Array<Object>
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }
    if (files && files.length > 0) {
      const file = files[0]

      const ext = file.name.split('.').pop()

      // check if file is supported
      const err = this.checkFile(file)
      if (err) {
        debug.error(err)
        MessageActions.showMessage({title: 'Error', message: err})
        return
      }

      this.checkFileSize(file)
        .then(() => {
          // read the file
          const img = new Image()

          img.onload = () => {
            // get the original size
            const width = img.width
            const height = img.height
            // save exif data and image to state
            EXIF.getData(img, () => {
              const exifdata = img.exifdata

              const tempCanvas = document.createElement('canvas')
              tempCanvas.width = width
              tempCanvas.height = height

              if (exifdata.Orientation && exifdata.Orientation !== 1) {
                // transfrom the canvas
                const ctx: any = tempCanvas.getContext('2d')
                switch (exifdata.Orientation) {
                  case 1:
                    ctx.transform(1, 0, 0, 1, 0, 0)
                    break
                  case 2:
                    ctx.transform(-1, 0, 0, 1, width, 0)
                    break
                  case 3:
                    ctx.transform(-1, 0, 0, -1, width, height)
                    break
                  case 4:
                    ctx.transform(1, 0, 0, -1, 0, height)
                    break
                  case 5:
                    // swap width/height
                    tempCanvas.width = height
                    tempCanvas.height = width
                    ctx.transform(0, 1, 1, 0, 0, 0)
                    break
                  case 6:
                    // swap width/height
                    tempCanvas.width = height
                    tempCanvas.height = width
                    ctx.transform(0, 1, -1, 0, height, 0)
                    break
                  case 7:
                    // swap width/height
                    tempCanvas.width = height
                    tempCanvas.height = width
                    ctx.transform(0, -1, -1, 0, height, width)
                    break
                  case 8:
                    // swap width/height
                    tempCanvas.width = height
                    tempCanvas.height = width
                    ctx.transform(0, -1, 1, 0, 0, width)
                    break
                }
              }
              const context = tempCanvas.getContext('2d')
              if (context) {
                context.drawImage(img, 0, 0, img.width, img.height)
              }
              const data = tempCanvas.toDataURL(file.type, 1)
              _this.setState({src: data, exif: exifdata, file, img, ext, loading: false})
              $(tempCanvas).remove()
            })
          }

          img.onerror = () => {
            const message = t('Bad Image:') + ' ' + file.name
            debug.log(message)
            MessageActions.showMessage({title: 'Error', message})
          }

          img.src = window.URL.createObjectURL(file)
        }).catch((err) => {
          debug.error(err)
          MessageActions.showMessage({title: 'Error', message: err})
        })
    }
  }

  _crop = (e:{width: number, height: number, scaleX: number, scaleY: number}) => {
    this.setState({
      cropWidth: e.width,
      cropHeight: e.height,
      cropScaleX: e.scaleX,
      cropScaleY: e.scaleY
    })
  }

  onSave = () => {
    const _this = this
    const cropper = this.refs.cropper
    const canvas = cropper.getCroppedCanvas()

    // resize the image
    this.resizeImage(canvas).then((dataURL) => {
      _this.setState({show: false})

      const info = {
        width: _this.state.cropWidth,
        height: _this.state.cropHeight,
        exif: _this.state.exif
      }
      if (_this.props.onCrop) _this.props.onCrop(dataURL, info)
      _this.resetImageCrop()
    }).catch((err) => {
      debug.error(err)
      MessageActions.showMessage({title: 'Error', message: err})
    })
  }

  handleCloseSelected = () => {
    this.resetImageCrop()
    this.setState({show: false})
  }

  zoomIn = () => {
    this.refs.cropper.zoom(0.1)
  }

  zoomOut = () => {
    this.refs.cropper.zoom(-0.1)
  }

   cropOriginal = () => {
     this.resetCropPosition()
     this.setState({autoCropArea: 1, aspectRatio: NaN})
   }

  aspect16by9 = () => {
    this.setState({aspectRatio: 16 / 9})
  }

  aspect3by2 = () => {
    this.setState({aspectRatio: 3 / 2})
  }

  aspectSquare = () => {
    this.setState({aspectRatio: 1 / 1})
  }

  resetCropPosition = () => {
    this.setState({
      autoCropArea: 1,
      aspectRatio: NaN
    })
    this.refs.cropper.reset()
  }

  resetImageCrop = () => {
    if (this.refs.cropper && this.refs.cropper.reset) this.refs.cropper.reset()
    if (this.refs.cropper && this.refs.cropper.clear) this.refs.cropper.clear()
    this.setState({
      img: null,
      src: null,
      selectedFile: null,
      file: null,
      show: false,
      preview: null,
      autoCropArea: this.props.autoCropArea,
      aspectRatio: this.props.aspectRatio
    })
  }

  render () {
    const {t} = this
    let cropper = ''
    if (this.state.src) {
      if (typeof window !== 'undefined') {
        const Cropper = require('react-cropper').default
        cropper = (
          <Cropper
            style={{height: 'calc(100% - 10px)', paddingBottom: '10px', width: '100%'}}
            autoCropArea={this.state.autoCropArea}
            aspectRatio={this.state.aspectRatio}
            guides={false}
            src={this.state.src}
            ref='cropper'
            crop={this._crop} />
        )
      }
    } else {
      cropper = (
        <div className='valign-wrapper' style={{height: '75%'}}>
          <h5 className='center-align valign' style={{margin: 'auto'}}>{t('Choose an image file')}</h5>
        </div>
      )
    }

    let toolButtons = ''
    let saveButton = ''
    let cropOriginalBtn = ''
    let crop16by9Btn = ''
    let crop3by2Btn = ''
    let cropSquareBtn = ''
    if (this.state.src) {
      if (!this.props.lockAspect) {
        cropOriginalBtn = (
          <a className='btn-floating btn waves-effect waves-light' onClick={this.cropOriginal}><i className='material-icons'>crop_original</i></a>
        )
        crop16by9Btn = (
          <a className='btn-floating btn waves-effect waves-light' onClick={this.aspect16by9}><i className='material-icons'>crop_16_9</i></a>
        )
        crop3by2Btn = (
          <a className='btn-floating btn waves-effect waves-light' onClick={this.aspect3by2}><i className='material-icons'>crop_3_2</i></a>
        )
        cropSquareBtn = (
          <a className='btn-floating btn waves-effect waves-light' onClick={this.aspectSquare}><i className='material-icons'>crop_square</i></a>
        )
      }

      toolButtons = (
        <div className='col s12'>
          <a className='btn-floating btn waves-effect waves-light' onClick={this.zoomIn}><i className='material-icons'>zoom_in</i></a>
          <a className='btn-floating btn waves-effect waves-light' onClick={this.zoomOut}><i className='material-icons'>zoom_out</i></a>
          {cropOriginalBtn}{crop16by9Btn}{crop3by2Btn}{cropSquareBtn}
          <a className='btn-floating btn waves-effect waves-light' onClick={this.resetCropPosition}><i className='material-icons'>restore</i></a>
        </div>
      )

      saveButton = (
        <div ref='saveButton' className='fixed-action-btn action-button-bottom-right'>
          <Tooltip
            title={t('Save')}
            position='top' inertia followCursor>
            <a onMouseDown={this.onSave} className='btn-floating btn-large omh-color'>
              <i className='large material-icons'>save</i>
            </a>
          </Tooltip>
        </div>
      )
    }

    return (
      <Modal show={this.state.show} id='image-crop-modal' className='image-crop-modal' dismissible={false} fixedFooter={false}>
        <ModalContent style={{padding: 0, margin: 0, height: '100%', overflow: 'hidden'}}>
          <a className='omh-color' style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.handleCloseSelected}>
            <i className='material-icons selected-feature-close' style={{fontSize: '35px'}}>close</i>
          </a>
          <div className='row no-padding' style={{height: '80px', marginRight: '35px', marginLeft: '0px', marginBottom: '0px'}}>
            <div className='col s12'>
              <div className='file-field input-field'>
                <div className='btn'>
                  <span>{t('Choose File')}</span>
                  <input type='file' onChange={this._onChange} value={this.state.selectedFile} />
                </div>
                <div className='file-path-wrapper'>
                  <input className='file-path validate' type='text' value={this.state.selectedFile} />
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
            <br style={{clear: 'both'}} />
            {saveButton}
          </div>
        </ModalContent>
      </Modal>
    )
  }
// <Progress id="imagecrop-loading" title={t('Loading')} subTitle="" dismissible={false} show={this.state.loading}/>
}
