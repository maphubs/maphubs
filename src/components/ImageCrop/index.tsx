import React, { useState, useRef, useEffect } from 'react'
// import dynamic from 'next/dynamic'
import { Row, Modal, Button, notification, Upload } from 'antd'
import 'cropperjs/dist/cropper.css'
import $ from 'jquery'
import ImageCropToolbar from './ImageCropToolbar'
import EXIF from 'exif-js'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate'

import useT from '../../hooks/useT'
import Cropper, { ReactCropperElement } from 'react-cropper'
import Pica from 'pica'
import { RcFile } from 'rc-upload/lib/interface'

/*
const Pica = dynamic(
  () => import('../../../node_modules/pica/dist/pica.min.js'),
  {
    ssr: false
  }
)
*/

const { Dragger } = Upload
const debug = DebugService('ImageCrop')

type Props = {
  onCrop: (dataURL: string, info: Record<string, unknown>) => void
  onCancel: () => void
  lockAspect?: boolean
  aspectRatio?: number
  autoCropArea: number
  allowedExtensions: Array<string>
  max_size: number
  skip_size: number
  jpeg_quality: number
  resize_height?: number
  resize_max_height?: number
  resize_width?: number
  resize_max_width?: number
  visible?: boolean
  imageData?: any
}
type File = {
  size: number
  type: string
}
type FileState = {
  img?: Record<string, any>
  file?: File
  preview?: Record<string, any>
  selectedFile?: string
  exif: Record<string, any>
  ext?: string
  src?: any
}

type CropState = {
  cropWidth: number
  cropHeight: number
  cropScaleX?: number
  cropScaleY?: number
}

const ImageCrop = ({
  lockAspect,
  autoCropArea,
  aspectRatio,
  allowedExtensions,
  max_size,
  imageData,
  resize_height,
  resize_width,
  resize_max_height,
  resize_max_width,
  jpeg_quality,
  skip_size,
  onCancel,
  onCrop,
  visible
}: Props): JSX.Element => {
  const { t } = useT()
  const cropperRef = useRef<ReactCropperElement>()
  const [loading, setLoading] = useState(false)
  const [fileState, setFileState] = useState<FileState>({
    file: {
      size: 0,
      type: ''
    },
    selectedFile: '',
    exif: {}
  })
  const [cropState, setCropState] = useState<CropState>({
    cropWidth: 0,
    cropHeight: 0
  })

  // allow imageData to be loaded dynamically (used by Story editor toolbar?)
  useEffect(() => {
    if (imageData && !fileState.src) {
      setFileState({
        ...fileState,
        src: imageData
      })
    }
  }, [fileState, imageData])

  const checkFileSize = (file: Record<string, any>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const maxSize = max_size
      let message

      if (file.size > maxSize) {
        message = t('Maximum Size Exceeded:') + ' ' + Math.round(maxSize / 1024)
        debug.log(message)
        return reject(new Error(message))
      }

      return resolve()
    })
  }
  const resizeImage = (sourceCanvas: any): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // If image size smaller than 'skip_size' - skip resizing
      if (fileState.file && fileState.file.size < skip_size) {
        const data = sourceCanvas.toDataURL(fileState.file.type)
        resolve(data)
        return
      }

      let scaledHeight: number, scaledWidth: number

      if (resize_height && !resize_width) {
        // If only height defined - scale to fit height,
        // and crop by max_width
        scaledHeight = resize_height
        const proportionalWidth: number = Math.floor(
          (cropState.cropWidth * scaledHeight) / cropState.cropHeight
        )
        scaledWidth =
          !resize_max_width || resize_max_width > proportionalWidth
            ? proportionalWidth
            : resize_max_width
      } else if (!resize_height && resize_width) {
        // If only width defined - scale to fit width,
        // and crop by max_height
        scaledWidth = resize_width
        const proportionalHeight: number = Math.floor(
          (cropState.cropHeight * scaledWidth) / cropState.cropWidth
        )
        scaledHeight =
          !resize_max_height || resize_max_height > proportionalHeight
            ? proportionalHeight
            : resize_max_height
      } else if (resize_height && resize_width) {
        // If determine both width and height
        scaledWidth = resize_width
        scaledHeight = resize_height
      } else if (!resize_width && resize_max_width) {
        // force a maximum, but allow any dimensions less than, unlike the options above this is not garunteed to return a specific width
        if (cropState.cropWidth > resize_max_width) {
          scaledWidth = resize_max_width
          const proportionalHeight = Math.floor(
            (cropState.cropHeight * scaledWidth) / cropState.cropWidth
          )
          scaledHeight =
            !resize_max_height || resize_max_height > proportionalHeight
              ? proportionalHeight
              : resize_max_height
        } else {
          // no need to resize
          if (fileState.file) {
            const data = sourceCanvas.toDataURL(fileState.file.type)
            resolve(data)
          } else {
            throw new Error('missing file')
          }

          return
        }
      }

      const quality = jpeg_quality
      const alpha = fileState.ext === 'png'
      const dest = document.createElement('canvas')
      dest.width = scaledWidth
      dest.height = scaledHeight

      if (Pica) {
        const picaInstance = Pica()
        return picaInstance
          .resize(sourceCanvas, dest, {
            alpha,
            unsharpAmount: 160,
            unsharpRadius: 0.6,
            unsharpThreshold: 1
          })
          .then((result) => {
            if (fileState.file) {
              const data = result.toDataURL(fileState.file.type, quality)
              return resolve(data)
            } else {
              throw new Error('missing file')
            }
          })
          .catch((err) => {
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
  const _onFileUpload = async (getFile: RcFile): Promise<string> => {
    const file = await getFile
    console.log(file)

    setLoading(true)

    if (file) {
      const ext = file.name.split('.').pop()

      // check if file is supported
      try {
        await checkFileSize(file)
        // read the file
        const img = new Image() as HTMLImageElement & {
          exifdata: Record<string, unknown>
        }
        img.addEventListener('load', () => {
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

            setFileState({
              src: data,
              exif: exifdata,
              file,
              img,
              ext
            })
            setLoading(false)

            $(tempCanvas).remove()
          })
        })
        img.addEventListener('error', () => {
          const message = t('Bad Image:') + ' ' + file.name
          debug.log(message)
          notification.error({
            message: t('Error'),
            description: message,
            duration: 0
          })
        })
        img.src = window.URL.createObjectURL(file)
      } catch (err) {
        debug.error(err)
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      }
    }
    return '' //not clear if rc-upload does anything with this, but keeps TS happy
  }
  const _crop = (e: {
    detail: {
      x: number
      y: number
      width: number
      height: number
      rotate: number
      scaleX: number
      scaleY: number
    }
  }) => {
    setCropState({
      cropWidth: e.detail.width,
      cropHeight: e.detail.height,
      cropScaleX: e.detail.scaleX,
      cropScaleY: e.detail.scaleY
    })
  }
  const onSave = () => {
    const canvas = cropperRef.current.cropper.getCroppedCanvas()
    // resize the image
    resizeImage(canvas)
      .then((dataURL) => {
        const info = {
          width: cropState.cropWidth,
          height: cropState.cropHeight,
          exif: fileState.exif
        }
        if (onCrop) onCrop(dataURL, info)

        resetImageCrop()
      })
      .catch((err) => {
        debug.error(err)
        notification.error({
          message: 'Error',
          description: err.message || err.toString() || err,
          duration: 0
        })
      })
  }

  const handleCloseSelected = () => {
    resetImageCrop()
    onCancel()
  }

  const zoomIn = (): void => {
    cropperRef.current.cropper.zoom(0.1)
  }
  const zoomOut = (): void => {
    cropperRef.current.cropper.zoom(-0.1)
  }

  const cropOriginal = (): void => {
    resetCropPosition()
    const { img } = fileState
    if (img) {
      cropperRef.current.cropper.setAspectRatio(img.width / img.height)
    }
  }

  const aspect16by9 = (): void => {
    cropperRef.current.cropper.setAspectRatio(16 / 9)
  }
  const aspect3by2 = (): void => {
    cropperRef.current.cropper.setAspectRatio(3 / 2)
  }
  const aspectSquare = (): void => {
    cropperRef.current.cropper.setAspectRatio(1)
  }
  const resetCropPosition = (): void => {
    console.log('resetting crop position')
    if (cropperRef.current.cropper.reset) cropperRef.current.cropper.reset()
  }
  const resetImageCrop = (): void => {
    if (cropperRef.current.cropper.reset) cropperRef.current.cropper.reset()
    if (cropperRef.current.cropper.clear) cropperRef.current.cropper.clear()
    setFileState({
      src: undefined,
      img: undefined,
      file: {
        size: 0,
        type: ''
      },
      preview: undefined,
      selectedFile: '',
      exif: {}
    })
    setCropState({
      cropWidth: 0,
      cropHeight: 0
    })
    setLoading(false)
  }

  const { src, img } = fileState
  return (
    <div>
      <style jsx global>
        {`
          .ant-modal-content {
            height: 100%;
          }
        `}
      </style>
      <Modal
        title={t('Select Image')}
        visible={visible}
        destroyOnClose
        onOk={onSave}
        centered
        bodyStyle={{
          height: 'calc(100% - 110px)',
          padding: '2px'
        }}
        width='80vw'
        footer={[
          <Button key='back' onClick={handleCloseSelected}>
            Cancel
          </Button>,
          <Button key='submit' type='primary' disabled={!src} onClick={onSave}>
            Save
          </Button>
        ]}
        onCancel={handleCloseSelected}
      >
        {!src && (
          <Row
            justify='center'
            align='middle'
            style={{
              height: '100%'
            }}
          >
            <Dragger
              name='file'
              action={_onFileUpload}
              style={{
                width: '400px'
              }}
              accept={allowedExtensions.toString()}
            >
              <p className='ant-upload-drag-icon'>
                <AddPhotoAlternateIcon
                  style={{
                    color: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
                    fontSize: 64
                  }}
                />
              </p>
              <p className='ant-upload-text'>
                {t('Click or drag file to this area to upload')}
              </p>
              <p className='ant-upload-hint'>PNG (.png), JPEG (.jpg, .jpeg)</p>
            </Dragger>
          </Row>
        )}
        {src && (
          <>
            <Row
              align='middle'
              style={{
                height: '50px'
              }}
            >
              <ImageCropToolbar
                lockAspect={lockAspect}
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                cropOriginal={cropOriginal}
                aspect16by9={aspect16by9}
                aspect3by2={aspect3by2}
                aspectSquare={aspectSquare}
                resetCropPosition={resetCropPosition}
                t={t}
              />
            </Row>
            <Row
              style={{
                height: 'calc(100% - 100px)',
                maxHeight: 'calc(100vh - 200px)',
                overflow: 'auto'
              }}
            >
              <Cropper
                style={{
                  height: '100%',
                  width: '100%'
                }}
                autoCropArea={autoCropArea}
                initialAspectRatio={
                  aspectRatio || (img?.width ?? 1) / (img?.height ?? 1)
                }
                guides={false}
                minContainerWidth={200}
                minContainerHeight={200}
                src={src}
                ref={cropperRef}
                crop={_crop}
              />
            </Row>
          </>
        )}
      </Modal>
    </div>
  )
}
ImageCrop.defaultProps = {
  autoCropArea: 1,
  allowedExtensions: '.jpg,.jpeg,.png',
  max_size: 5_242_880,
  // 5MB
  skip_size: 10_000,
  // 10kb
  jpeg_quality: 75
}
export default ImageCrop
