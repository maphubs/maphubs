// @flow
import React from 'react'
import _isequal from 'lodash.isequal'
import ErrorBoundary from '../ErrorBoundary'

import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-min-noconflict/ext-language_tools'
import 'ace-builds/src-min-noconflict/ext-spellcheck'
import 'ace-builds/src-min-noconflict/ext-searchbox'
const ace = require('ace-builds/src-noconflict/ace')
ace.config.set('basePath', 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/')
ace.config.setModuleUrl('ace/mode/javascript_worker', 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/worker-javascript.js')

type Props = {|
  name: string,
  onChange: Function,
  value: string,
  mode: string,
  theme: string
|}

type State = {
  canSave?: boolean
}

export default class CodeEditor extends React.Component<Props, State> {
  static defaultProps = {
    name: 'code-editor',
    mode: 'json',
    theme: 'monokai'
  }

  editor: any

  shouldComponentUpdate (nextProps: Props) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  onChange = (value: any) => {
    if (this.state.canSave) this.props.onChange(value)
  }

  render () {
    const { name, mode, theme, value } = this.props

    return (
      <ErrorBoundary>
        <AceEditor
          ref='ace'
          mode={mode}
          theme={theme}
          onChange={this.onChange}
          name={name}
          width='100%'
          height='100%'
          highlightActiveLine
          value={value}
          enableBasicAutocompletion
          enableLiveAutocompletion
          editorProps={{$blockScrolling: true}}
          onValidate={(annotations) => {
            let canSave = true
            if (annotations?.length > 0) {
              annotations.forEach((anno) => {
                if (anno.type === 'error') {
                  canSave = false
                }
              })
            }
            this.setState({canSave})
          }}
        />
      </ErrorBoundary>
    )
  }
}
