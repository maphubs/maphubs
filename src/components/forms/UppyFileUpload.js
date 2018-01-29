// @flow
import React from 'react'
import Uppy from 'uppy/lib/core'
import Tus from 'uppy/lib/plugins/Tus'
import Dashboard from 'uppy/lib/react/Dashboard'
// import GoogleDrive from 'uppy/lib/plugins/GoogleDrive';
// import Dropbox from 'uppy/lib/plugins/Dropbox';

import MapHubsComponent from '../MapHubsComponent'

type Props = {
  endpoint: string,
  note: string,
  onComplete: Function,
  onError: Function,
  maxHeight: number
}

type State = {

}

export default class UppyFileUpload extends MapHubsComponent<Props, State> {
  static defaultProps = {
    maxHeight: 300
  }
  componentDidMount () {
    this.uppy = Uppy({
      id: 'uppy',
      autoProceed: true,
      debug: false,
      restrictions: {
        maxFileSize: false,
        maxNumberOfFiles: 1,
        minNumberOfFiles: false,
        allowedFileTypes: false
      },
      thumbnailGeneration: false
    })
    // this.uppy.use(GoogleDrive, { host: 'http://localhost:3020' });
    // this.uppy.use(Dropbox, { host: 'http://localhost:3020' });
    this.uppy.use(Tus, { endpoint: this.props.endpoint })

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
    const {note, maxHeight} = this.props
    if (this.uppy) {
      return (
        <Dashboard
          uppy={this.uppy}
          // plugins={['GoogleDrive', 'Dropbox']}
          inline
          maxHeight={maxHeight}
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
              dropPasteImport: 'Drop files here, paste, import from one of the locations above or',
              dropPaste: 'Drop files here, paste or',
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
