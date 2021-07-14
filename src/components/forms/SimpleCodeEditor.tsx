import React, { useState } from 'react'
import _isequal from 'lodash.isequal'
import ErrorBoundary from '../ErrorBoundary'
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
  name: string
  onChange: (code: string) => void
  value: string
  mode: string
  theme: string
}
type State = {
  canSave?: boolean
}
const CodeEditor = ({
  name,
  mode,
  theme,
  value,
  onChange
}: Props): JSX.Element => {
  const { t } = useT()
  const [canSave, setCanSave] = useState(false)

  return (
    <ErrorBoundary t={t}>
      <AceEditor
        mode={mode}
        theme={theme}
        onChange={(code: string) => {
          if (canSave) onChange(code)
        }}
        name={name}
        width='100%'
        height='100%'
        highlightActiveLine
        value={value}
        enableBasicAutocompletion
        enableLiveAutocompletion
        editorProps={{
          $blockScrolling: true
        }}
        onValidate={(annotations) => {
          let canSaveUpdate = true

          if (annotations?.length > 0) {
            for (const anno of annotations) {
              if (anno.type === 'error') {
                canSaveUpdate = false
              }
            }
          }
          setCanSave(canSaveUpdate)
        }}
      />
    </ErrorBoundary>
  )
}
CodeEditor.defaultProps = {
  name: 'code-editor',
  mode: 'json',
  theme: 'monokai'
}
export default CodeEditor
