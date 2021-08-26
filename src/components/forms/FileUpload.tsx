import React from 'react'
import { Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useT from '../../hooks/useT'
import { RcFile, UploadChangeParam } from 'antd/lib/upload'

type Props = {
  action: string
  onUpload: (fileResponse: UploadChangeParam['file']['response']) => void
  beforeUpload?: (file: RcFile) => void
}

const FileUpload = ({ action, onUpload, beforeUpload }: Props): JSX.Element => {
  const { t } = useT()
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
        }}
        progress={{
          strokeColor: {
            '0%': '#108ee9',
            '100%': '#87d068'
          },
          strokeWidth: 3,
          format: (percent) => `${Number.parseFloat(percent.toFixed(2))}%`
        }}
      >
        <Button>
          <UploadOutlined /> {t('Choose File')}
        </Button>
      </Upload>
    </>
  )
}
export default FileUpload
