// @flow

import * as React from 'react'
import { Tabs, Tooltip } from 'antd'
import AutoSizer from 'react-virtualized-auto-sizer'
import CKEditor from '@ckeditor/ckeditor5-react'
import MapHubsEditor from '@maphubs/maphubs-story-editor'
import localeUtil from '../../locales/util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const supportedLangs = localeUtil.getSupported()
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
  language?: string,
  story_id: number
}

export default class StoryCKEditor extends React.Component<Props, void> {
  editorInstance: any

  domContainer: any

  constructor (props: Props) {
    super(props)
    this.editorInstance = undefined
  }

  static defaultProps: {|initialData: string, language: string|} = {
    initialData: '',
    language: 'en'
  }

  shouldComponentUpdate (): boolean {
    return false
  }

  render (): React.Node {
    const { initialData, language, getMap, cropImage, onImageUpload, story_id } = this.props
    const host = MAPHUBS_CONFIG.host ? MAPHUBS_CONFIG.host.replace('.', '') : 'unknownhost'
    const editorConfiguration = {
      language,
      maphubsMap: {
        getMap
      },
      maphubsUpload: {
        assetUploadAPI: `${MAPHUBS_CONFIG.ASSET_UPLOAD_API}/image/upload`, // maphubs asset upload service
        assetUploadAPIKey: MAPHUBS_CONFIG.ASSET_UPLOAD_API_KEY, //
        subfolder: `${host}-stories`, // can be used to group content by host and or type
        subfolderID: story_id, // an id for example a story id that can be used to bulk delete content later
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
                height: ${height - 80}px;
                overflow-y: scroll;
              }
              .ck-content p {
                font-size: 20px;
              }
              .ck-content ul {
                list-style: initial;
                font-size: 20px;
                padding-left: 40px;
              }
              .ck-content ul li {
                list-style-type: inherit;
              }
              .ck-content ol {
                font-size: 20px;
              }
              .ck-content a {
                color: ${MAPHUBS_CONFIG.primaryColor};
                text-decoration: underline;
              }
            `}
            </style>
            <Tabs
              size='small'
              tabBarStyle={{marginBottom: 0, paddingLeft: '10px'}}
              animated={false}
            >
              {langs.map(locale => {
                const data = initialData ? initialData[locale.value] : ''
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
              })}
            </Tabs>
          </div>
        )}
      </AutoSizer>
    )
  }
}
