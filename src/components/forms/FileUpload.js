// @flow
import React from 'react'
import FileUploadProgress from 'react-fileupload-progress'
import MapHubsComponent from '../MapHubsComponent'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('FileUpload')

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

type State = {
  uploading?: boolean
}

export default class FileUpload extends MapHubsComponent<Props, State> {
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
    debug.log('upload progress: ' + progress)
    if (progress === 100) {
      if (this.props.onFinishTx) {
        this.props.onFinishTx()
      }
    }
  }

  onLoad =(e: any) => {
    const dataTxt = e.target.response
    const data = JSON.parse(dataTxt)
    this.setState({uploading: false})
    this.props.onUpload(data)
  }

  onError = (e: any, request: any) => {
    if (this.props.onError) this.props.onError(e, request)
  }

  onAbort = (e: any, request: any) => {
    if (this.props.onAbort) this.props.onAbort(e, request)
  }

  formGetter = () => {
    const element: any = document.getElementById('customForm')
    if (element) {
      const formElement: HTMLFormElement = ((element: any): HTMLFormElement)

      return new FormData(formElement)
    }
  }

  onClick = () => {
    this.refs.input.click()
  }

  customFormRenderer = (onSubmit: Function, onFileClick: Function) => {
    const {t} = this
    const _this = this
    const onSubmitWrapper = (val) => {
      if (_this.props.onChange) {
        _this.props.onChange()
      }
      onSubmit(val)
    }
    const formRenderer = (
      <div className='col s12 m4 l3' onClick={onFileClick} style={this.props.style}>
        <form id='customForm' ref='form' method='post' style={{marginBottom: '15px'}}>
          <div className='row file-field input-field'>
            <div className='col s12'>

              <div className='btn'>
                <span>{t('Choose File')}</span>
                <input type='file' name='file' style={this.props.inputStyle} ref='input' onChange={onSubmitWrapper} />
              </div>
            </div>
          </div>
        </form>
      </div>
    )
    return formRenderer
  }

  customProgressRenderer = (progress: number, hasError: boolean, cancelHandler: Function) => {
    const {t} = this
    let progressRenderer
    if (hasError || progress > -1) {
      const progressPct = progress + '%'

      let message = (<span>{progressPct}</span>)
      if (hasError) {
        message = (<span style={{color: '#a94442'}}>{t('Failed to upload ...')}</span>)
      }
      if (progress === 100) {
        message = (<span>{t('Done')}</span>)
      }

      progressRenderer = (
        <div className='col s12 m8 l9'>
          <div className='progress col s10' style={{marginTop: '18px'}}>
            <div className='determinate' style={{width: progressPct}} />
          </div>
          <div className='col s2'>
            <button className='btn-floating' onClick={cancelHandler}>
              <i className='material-icons'>close</i>
            </button>
          </div>

          <div style={{clear: 'left', textAlign: 'center'}}>
            {message}
          </div>
        </div>
      )
    } else {
      progressRenderer = (<div />)
    }
    return progressRenderer
  }

  render () {
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
    )
  }
}
