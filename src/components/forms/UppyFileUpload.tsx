import React from 'react'
import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
// import GoogleDrive from '@uppy/google-drive';
// import Dropbox from '@uppy/dropbox';

type Props = {
  endpoint: string
  note: string
  onComplete: (...args: Array<any>) => any
  onError: (...args: Array<any>) => any
  height: number
  maxFileSize?: number
  allowedFileTypes?: Array<string>
  meta?: Record<string, any>
  headers?: Record<string, any>
}
export default class UppyFileUpload extends React.Component<Props> {
  static defaultProps:
    | any
    | {
        height: number
      } = {
    height: 300
  }

  constructor(props: Props) {
    super(props)
    const { maxFileSize, allowedFileTypes, meta, headers, endpoint } = props
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
    this.uppy.use(Tus, {
      endpoint,
      headers: headers || {}
    })
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

  render(): JSX.Element | string {
    const { note, height } = this.props

    return this.uppy ? (
      <>
        <style jsx global>
          {`
            .uppy-DashboardAddFiles-info {
              display: block !important;
            }
          `}
        </style>
        <Dashboard
          uppy={this.uppy} // plugins={['GoogleDrive', 'Dropbox']}
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
              dashboardWindowTitle:
                'Uppy Dashboard Window (Press escape to close)',
              dashboardTitle: 'Uppy Dashboard',
              copyLinkToClipboardSuccess: 'Link copied to clipboard.',
              copyLinkToClipboardFallback: 'Copy the URL below',
              fileSource: 'File source',
              done: 'Done',
              localDisk: 'Local Disk',
              myDevice: 'My Device',
              dropPasteImport:
                'Drop files here, paste, %{browse} or import from',
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
      </>
    ) : (
      ''
    )
  }
}
