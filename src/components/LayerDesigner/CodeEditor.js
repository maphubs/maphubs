// @flow
import React from 'react'
import { Modal, Button } from 'antd'
import _isequal from 'lodash.isequal'
import MapHubsComponent from '../MapHubsComponent'

let AceEditor = ''

type Props = {|
  id: string,
  onSave: Function,
  title: string,
  code: string,
  mode: string,
  theme: string,
  modal: boolean
|}

type State = {
  code: string,
  canSave: boolean,
  show: boolean
}

export default class CodeEditor extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    id: 'code-editor',
    mode: 'json',
    theme: 'monokai',
    modal: true
  }

  editor: any

  constructor (props: Props) {
    super(props)
    this.state = {
      code: props.code,
      canSave: true,
      show: false
    }
  }

  componentDidMount () {
    require('brace')
    AceEditor = require('react-ace').default
    require('brace/mode/json')
    require('brace/mode/html')
    require('brace/theme/monokai')
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({code: nextProps.code})
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  componentDidUpdate () {
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
        _this.setState({canSave})
      })
    }
  }

  show = () => {
    this.setState({show: true})
  }

  hide = () => {
    this.setState({show: false})
  }

  onChange = (code: any) => {
    this.setState({code})
  }

  onCancel = () => {
    this.hide()
  }

  onSave = () => {
    if (this.state.canSave) {
      if (this.props.modal) {
        this.hide()
      }
      this.props.onSave(this.state.code)
    }
  }

  render () {
    const {t} = this
    const { title, modal } = this.props
    const { show, canSave } = this.state
    let editor = ''
    if (show) {
      let enableBasicAutocompletion
      if (this.props.mode !== 'json') {
        enableBasicAutocompletion = true
      }
      editor = (
        <AceEditor
          ref='ace'
          mode={this.props.mode}
          theme={this.props.theme}
          onChange={this.onChange}
          name={this.props.id}
          width='100%'
          height='100%'
          highlightActiveLine
          enableBasicAutocompletion={enableBasicAutocompletion}
          value={this.state.code}
          editorProps={{$blockScrolling: true}}
        />
      )
    }
    if (modal) {
      return (
        <>
          <style jsx global> {`
          .ant-modal-content {
            height: 100%;
          }
        `}</style>
          <Modal
            title={title}
            visible={show}
            onOk={this.close}
            centered
            height='90vh'
            width='60vw'
            bodyStyle={{height: 'calc(100% - 110px)', padding: '0px'}}
            onCancel={this.onCancel}
            footer={[
              <Button key='back' onClick={this.onCancel}>
                {t('Cancel')}
              </Button>,
              <Button key='submit' type='primary' disabled={!canSave} onClick={this.onSave}>
                {t('Save')}
              </Button>
            ]}
          >
            <div className='left-align' style={{height: '100%'}}>
              {editor}
            </div>
          </Modal>
        </>
      )
    } else {
      return (
        <div style={{height: 'calc(100% - 100px)', width: '100%'}}>
          <p className='left no-padding'>{title}</p>
          {editor}
          <div className='right'>
            <Button type='primary' style={{float: 'none', marginTop: '15px'}} disabled={!canSave} onClick={this.onSave}>{t('Save')}</Button>
          </div>
        </div>
      )
    }
  }
}
