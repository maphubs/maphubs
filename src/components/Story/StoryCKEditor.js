// @flow

import * as React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import CKEditor from '@ckeditor/ckeditor5-react'

import MapHubsEditor from '@maphubs/maphubs-story-editor'

type Props = {
  initialData?: string,
  onChange?: Function,
  getMap?: Function,
  cropImage?: Function,
  onImageUpload?: Function,
  language?: string
}

export default class StoryCKEditor extends React.Component<Props, void> {
  editorInstance: any
  domContainer: any

  constructor (props: Props) {
    super(props)
    this.editorInstance = null
  }

  static defaultProps = {
    initialData: '',
    language: 'en'
  }

  shouldComponentUpdate () {
    return false
  }

  componentWillReceiveProps (newProps: Props) {
    if (this.editorInstance && newProps.data) {
      // this.editorInstance.setData(newProps.data)
    }
  }

  render () {
    const { initialData, language, getMap, cropImage, onImageUpload } = this.props
    const editorConfiguration = {
      language,
      maphubsMap: {
        getMap
      },
      maphubsUpload: {
        assetUploadAPI: 'assets.maphubs.com', // maphubs asset upload service
        assetUploadAPIKey: 'abc123', //
        subfolder: 'example', // can be used to group content by host and or type
        subfolderID: '', // an id for example a story id that can be used to bulk delete content later
        onUpload: onImageUpload,
        cropImage
      }
    }

    return (
      <AutoSizer disableWidth>
        {({ height }) => (
          <div style={{height}}>
            <CKEditor
              editor={MapHubsEditor}
              config={editorConfiguration}
              data={this.props.initialData}
              onInit={editor => {
                this.editorInstance = editor
                console.log('Init.', editor)
              }}
              onChange={(event, editor) => {
                const data = editor.getData()
                if (this.props.onChange) this.props.onChange(data)
              }}
              onBlur={editor => {
                console.log('Blur.', editor)
              }}
              onFocus={editor => {
                console.log('Focus.', editor)
              }}
            /> 
          </div>
        )}
      </AutoSizer>
    )
  }
}
