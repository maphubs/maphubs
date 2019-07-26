// @flow

import * as React from 'react'
import { Tabs, Tooltip } from 'antd'
import AutoSizer from 'react-virtualized-auto-sizer'
import CKEditor from '@ckeditor/ckeditor5-react'
import MapHubsEditor from '@maphubs/maphubs-story-editor'
import localeUtil from '../../locales/util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

let supportedLangs = localeUtil.getSupported()
let languagesFromConfig
const langs = []
if (MAPHUBS_CONFIG.LANGUAGES) {
  languagesFromConfig = MAPHUBS_CONFIG.LANGUAGES.split(',')
  languagesFromConfig = languagesFromConfig.map(lang => lang.trim())
  supportedLangs.map(lang => {
    if (languagesFromConfig.includes(lang.value)) {
      langs.push(lang)
    }
  })
}

const TabPane = Tabs.TabPane

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
      },
      mediaEmbed: {
        previewsInData: true
      }
    }

    return (
      <AutoSizer disableWidth>
        {({ height }) => (
          <div>
            <style jsx global>{`
              .ck.ck-editor__main>.ck-editor__editable {
                height: ${height - 40}px;
                overflow-y: scroll;
              }
            `}</style>
            <Tabs size='small'
              tabBarStyle={{marginBottom: 0}}
              animated={false}
            >
              {langs.map(locale => {
                const data = initialData[locale.value] || ''
                return (
                  <TabPane
                    tab={<Tooltip title={locale.name}><span>{locale.label}</span></Tooltip>}
                    key={locale.value}
                  >
                    <div style={{padding: '0px'}}>
                      <CKEditor
                        editor={MapHubsEditor}
                        config={editorConfiguration}
                        data={data}
                        onInit={editor => {
                          this.editorInstance = editor
                          console.log('Init.', editor)
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          if (this.props.onChange) this.props.onChange(locale.value, data)
                        }}
                        onBlur={editor => {
                          // console.log('Blur.', editor)
                        }}
                        onFocus={editor => {
                          // console.log('Focus.', editor)
                        }}
                      />
                    </div>
                  </TabPane>
                )
              })
              }
            </Tabs>
          </div>
        )}
      </AutoSizer>
    )
  }
}
