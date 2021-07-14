import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import CKEditor from '@ckeditor/ckeditor5-react'
import MapHubsEditor from '@maphubs/maphubs-story-editor'
type Props = {
  initialData?: string
  onChange?: (data: string) => void
  language?: string
}
const NoteCKEditor = ({
  initialData,
  language,
  onChange
}: Props): JSX.Element => {
  const editorConfiguration = {
    language: language || 'en',
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'link',
        'bulletedList',
        'numberedList',
        'blockQuote',
        'insertTable',
        'highlight',
        'alignment',
        'removeFormat',
        '|',
        'undo',
        'redo'
      ]
    }
  }
  return (
    <AutoSizer>
      {({ height, width }) => (
        <div
          style={{
            width: `${width}px`,
            height: `${height - 40}px`
          }}
        >
          <style jsx global>
            {`
              .ck.ck-editor__main > .ck-editor__editable {
                height: ${height - 40}px;
                overflow-y: scroll;
              }
            `}
          </style>
          <CKEditor
            editor={MapHubsEditor}
            config={editorConfiguration}
            data={initialData || ''}
            onInit={(editor) => {
              //console.log('Init.', editor)
            }}
            onChange={(event, editor) => {
              const data = editor.getData()
              // console.log(data)
              if (onChange) onChange(data)
            }}
          />
        </div>
      )}
    </AutoSizer>
  )
}
export default NoteCKEditor
