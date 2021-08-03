import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'antd'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-min-noconflict/ext-language_tools'
import 'ace-builds/src-min-noconflict/ext-spellcheck'
import 'ace-builds/src-min-noconflict/ext-searchbox'
import ace from 'ace-builds/src-noconflict/ace'
import useT from '../../hooks/useT'

ace.config.set(
  'basePath',
  'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/'
)
ace.config.setModuleUrl(
  'ace/mode/javascript_worker',
  'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/worker-javascript.js'
)
type Props = {
  id: string
  onSave: (code: string) => void
  onCancel?: () => void
  title: string
  initialCode: string
  mode: string
  theme?: string
  modal?: boolean
  visible?: boolean
}

const CodeEditor = ({
  title,
  modal,
  mode,
  theme,
  id,
  onCancel,
  visible,
  initialCode,
  onSave
}: Props): JSX.Element => {
  const { t } = useT()
  const [show, setShow] = useState(visible)
  const [canSave, setCanSave] = useState(true)
  const [code, setCode] = useState(initialCode)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  const save = (): void => {
    if (canSave) {
      onSave(code)
    }
  }

  let editor = <></>

  if (visible) {
    editor = (
      <AceEditor
        mode={mode}
        theme={theme}
        onChange={setCode}
        name={id}
        width='100%'
        height='100%'
        highlightActiveLine
        enableBasicAutocompletion
        enableLiveAutocompletion
        value={code}
        editorProps={{
          $blockScrolling: true
        }}
        onValidate={(annotations) => {
          let canSave = true

          if (annotations?.length > 0) {
            for (const anno of annotations) {
              if (anno.type === 'error') {
                canSave = false
              }
            }
          }
          setCanSave(canSave)
        }}
      />
    )
  }

  return modal ? (
    <>
      <style jsx global>
        {`
          .ant-modal-content {
            height: 100%;
          }
        `}
      </style>
      <Modal
        title={title}
        visible={visible}
        centered
        width='60vw'
        bodyStyle={{
          height: 'calc(100% - 110px)',
          padding: '0px'
        }}
        onCancel={() => {
          if (onCancel) onCancel()
        }}
        footer={[
          <Button
            key='back'
            onClick={() => {
              if (onCancel) onCancel()
            }}
          >
            {t('Cancel')}
          </Button>,
          <Button
            key='submit'
            type='primary'
            disabled={!canSave}
            onClick={save}
          >
            {t('Save')}
          </Button>
        ]}
      >
        <div
          style={{
            height: '100%'
          }}
        >
          {editor}
        </div>
      </Modal>
    </>
  ) : (
    <div
      style={{
        height: 'calc(100% - 100px)',
        width: '100%'
      }}
    >
      <p>{title}</p>
      {editor}
      <div
        style={{
          float: 'right'
        }}
      >
        <Button
          type='primary'
          style={{
            float: 'none',
            marginTop: '15px'
          }}
          disabled={!canSave}
          onClick={save}
        >
          {t('Save')}
        </Button>
      </div>
    </div>
  )
}
CodeEditor.defaultProps = {
  theme: 'monokai',
  modal: true
}
export default CodeEditor
