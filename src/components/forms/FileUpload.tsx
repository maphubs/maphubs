import React from 'react'
import { Button, Upload, Progress, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
// import FileUploadProgress from 'react-fileupload-progress'
type Props = {
  action: string
  onUpload: (...args: Array<any>) => any
  t: (...args: Array<any>) => any
  beforeUpload?: (...args: Array<any>) => any
}
type State = {
  status?: string
  progress?: number
}
export default class FileUpload extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render(): JSX.Element {
    const { action, onUpload, beforeUpload, t } = this.props
    const { progress } = this.state
    return (
      <>
        <Upload
          name='file'
          action={action}
          beforeUpload={(file) => {
            if (beforeUpload) beforeUpload(file)
          }}
          onChange={(info) => {
            if (info.file.status !== 'uploading') {
              console.log(info.file, info.fileList)
            }

            if (info.file.status === 'done') {
              message.success(`${info.file.name} file uploaded successfully`)
              onUpload(info.file.response)
            } else if (info.file.status === 'error') {
              message.error(`${info.file.name} file upload failed.`)
            }

            this.setState({
              status: info.file.status,
              progress: info.file.progress
            })
          }}
        >
          <Button>
            <UploadOutlined /> {t('Choose File')}
          </Button>
        </Upload>
        {progress && <Progress percent={progress} status='active' />}
      </>
    )
  }
}
