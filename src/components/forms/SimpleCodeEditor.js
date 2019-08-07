// @flow
import React from 'react'
import _isequal from 'lodash.isequal'
import ErrorBoundary from '../ErrorBoundary'
import brace from 'brace'
import AceEditor from 'react-ace'
import 'brace/mode/json'
import 'brace/mode/html'
import 'brace/theme/monokai'

type Props = {|
  name: string,
  onChange: Function,
  value: string,
  mode: string,
  theme: string
|}

export default class CodeEditor extends React.Component<Props, void> {
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
    const _this = this
    if (this.refs.ace) {
      this.editor = this.refs.ace.editor
      this.editor.getSession().on('changeAnnotation', () => {
        const annotations = _this.editor.getSession().getAnnotations()
        let canSave = true
        if (annotations && annotations.length > 0) {
          annotations.forEach((anno) => {
            if (anno.type === 'error') {
              canSave = false
            }
          })
        }
        if (canSave) _this.props.onChange(value)
      })
    }
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
          setOptions={{
            enableBasicAutocompletion: true
          }}
          editorProps={{$blockScrolling: true}}
        />
      </ErrorBoundary>
    )
  }
}
