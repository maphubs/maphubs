// @flow
import React from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/react'
import '@uppy/dashboard/dist/style.min.css'
import '@uppy/core/dist/style.min.css'
// import GoogleDrive from '@uppy/google-drive';
// import Dropbox from '@uppy/dropbox';

import MapHubsComponent from '../MapHubsComponent'

type Props = {
  endpoint: string,
  note: string,
  onComplete: Function,
  onError: Function,
  height: number,
  maxFileSize?: number,
  allowedFileTypes?: Array<string>,
  meta?: Object,
  headers?: Object
}

type State = {

}

export default class UppyFileUpload extends MapHubsComponent<Props, State> {
  static defaultProps = {
    height: 300
  }

  componentDidMount () {
    const {maxFileSize, allowedFileTypes, meta, headers, endpoint} = this.props
    this.uppy = Uppy({
      id: 'uppy',
      autoProceed: true,
      debug: false,
      restrictions: {
        maxFileSize,
        maxNumberOfFiles: 1,
        minNumberOfFiles: false,
        allowedFileTypes
      },
      thumbnailGeneration: false,
      meta
    })
    // this.uppy.use(GoogleDrive, { host: 'http://localhost:3020' });
    // this.uppy.use(Dropbox, { host: 'http://localhost:3020' });
    const config = {
      endpoint,
      headers: headers || {}
    }
    this.uppy.use(Tus, config)

    this.uppy.on('complete', (result) => {
      if (result.successful && result.successful.length === 1) {
        const file = result.successful[0]
        console.log(file)
        if (this.props.onComplete) {
          this.props.onComplete(file)
        }
      }
    })

    this.uppy.run()
  }

  render () {
    const {note, height} = this.props
    if (this.uppy) {
      return (
        <Dashboard
          uppy={this.uppy}
          // plugins={['GoogleDrive', 'Dropbox']}
          inline
          height={height}
          showProgressDetails
          showLinkToFileUploadResult={false}
          proudlyDisplayPoweredByUppy={false}
          note={note}
          locale={{
            strings: {
              selectToUpload: 'Select files to upload',
              closeModal: 'Close Modal',
              upload: 'Upload',
              importFrom: 'Import files from',
              dashboardWindowTitle: 'Uppy Dashboard Window (Press escape to close)',
              dashboardTitle: 'Uppy Dashboard',
              copyLinkToClipboardSuccess: 'Link copied to clipboard.',
              copyLinkToClipboardFallback: 'Copy the URL below',
              fileSource: 'File source',
              done: 'Done',
              localDisk: 'Local Disk',
              myDevice: 'My Device',
              dropPasteImport: 'Drop files here, paste, %{browse} or import from',
              dropPaste: 'Drop files here, paste or %{browse}',
              browse: 'browse',
              fileProgress: 'File progress: upload speed and ETA',
              numberOfSelectedFiles: 'Number of selected files',
              uploadAllNewFiles: 'Upload all new files',
              emptyFolderAdded: 'No files were added from empty folder',
              folderAdded: {
                0: 'Added %{smart_count} file from %{folder}',
                1: 'Added %{smart_count} files from %{folder}'
              }
            }
          }}
        />
      )
    } else {
      return ''
    }
  }
}
