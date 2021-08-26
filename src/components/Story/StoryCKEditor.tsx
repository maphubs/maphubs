import * as React from 'react'
import { Tabs, Tooltip } from 'antd'
import AutoSizer from 'react-virtualized-auto-sizer'
import CKEditor from '@ckeditor/ckeditor5-react'
import MapHubsEditor from '@maphubs/maphubs-story-editor'
import localeUtil from '../../locales/util'

const supportedLangs = localeUtil.getSupported()
let languagesFromConfig
const langs = []

if (process.env.NEXT_PUBLIC_LANGUAGES) {
  languagesFromConfig = process.env.NEXT_PUBLIC_LANGUAGES.split(',')
  languagesFromConfig = languagesFromConfig.map((lang) => lang.trim())
  supportedLangs.map((lang) => {
    if (languagesFromConfig.includes(lang.value)) {
      langs.push(lang)
    }
  })
}

const TabPane = Tabs.TabPane
type Props = {
  initialData?: string
  onChange?: (...args: Array<any>) => any
  getMap?: (...args: Array<any>) => any
  cropImage?: (...args: Array<any>) => any
  onImageUpload?: (...args: Array<any>) => any
  language?: string
  story_id: number
}
const StoryCKEditor = ({
  initialData,
  language,
  getMap,
  cropImage,
  onImageUpload,
  story_id,
  onChange
}: Props): JSX.Element => {
  const host = process.env.NEXT_PUBLIC_EXTERNAL_HOST
    ? process.env.NEXT_PUBLIC_EXTERNAL_HOST.replace('.', '')
    : 'unknownhost'
  const editorConfiguration = {
    language: language || 'en',
    maphubsMap: {
      getMap
    },
    maphubsUpload: {
      assetUploadAPI: `${process.env.NEXT_PUBLIC_ASSET_UPLOAD_API}/image/upload`,
      // maphubs asset upload service
      assetUploadAPIKey: process.env.NEXT_PUBLIC_ASSET_UPLOAD_API_KEY,
      //
      subfolder: `${host}-stories`,
      // can be used to group content by host and or type
      subfolderID: story_id,
      // an id for example a story id that can be used to bulk delete content later
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
          <style jsx global>
            {`
              .ck.ck-editor__main > .ck-editor__editable {
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
                color: ${process.env.NEXT_PUBLIC_PRIMARY_COLOR};
                text-decoration: underline;
              }
            `}
          </style>
          <Tabs
            size='small'
            tabBarStyle={{
              marginBottom: 0,
              paddingLeft: '10px'
            }}
            animated={false}
          >
            {langs.map((locale) => {
              const data = initialData ? initialData[locale.value] : ''
              return (
                <TabPane
                  tab={
                    <Tooltip title={locale.name}>
                      <span>{locale.label}</span>
                    </Tooltip>
                  }
                  key={locale.value}
                >
                  <div
                    style={{
                      padding: '0px'
                    }}
                  >
                    <CKEditor
                      editor={MapHubsEditor}
                      config={editorConfiguration}
                      data={data}
                      onInit={(editor) => {
                        //console.log('Init.', editor)
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData()
                        if (onChange) onChange(locale.value, data)
                      }}
                      onBlur={(editor) => {
                        // console.log('Blur.', editor)
                      }}
                      onFocus={(editor) => {
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
export default StoryCKEditor
