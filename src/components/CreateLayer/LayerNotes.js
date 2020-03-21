// @flow
import React from 'react'
import dynamic from 'next/dynamic'
import { Row, Button, notification, message } from 'antd'
import request from 'superagent'
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('stores/layer-notes')

const NoteCKEditor = dynamic(() => import('../forms/NoteCKEditor.js'), {
  ssr: false
})

type Props = {|
  notes?: string,
  t: Function,
  layer_id: number,
  canEdit: boolean,
  _csrf: string
|}

type State = {
  editing: boolean,
  notes: string,
  unsavedChanges?: boolean
}

export default class LayerNotes extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      editing: false,
      notes: props.notes || ''
    }
  }

  componentDidMount () {
    window.addEventListener('beforeunload', (e) => {
      if (this.state.editing) {
        e.preventDefault()
        e.returnValue = ''
      }
    })
  }

  startEditingNotes = () => {
    this.setState({editing: true})
  }

  handleNotesChange = (notes: string) => {
    this.setState({notes, unsavedChanges: true})
  }

  saveNotes = async () => {
    debug.log('save layer notes')
    const { t, layer_id, _csrf } = this.props
    const { notes } = this.state
    const closeSavingMessage = message.loading(t('Saving'), 0)
    try {
      const res = await request.post('/api/layer/notes/save')
        .type('json').accept('json')
        .send({
          layer_id,
          notes,
          _csrf
        })
      if (!res.body.success) {
        closeSavingMessage()
        notification.error({
          message: t('Error'),
          description: res.message || res.error || 'Error saving notes',
          duration: 0
        })
      } else {
        closeSavingMessage()
        message.success(t('Notes Saved'))
        this.setState({editing: false, unsavedChanges: false})
      }
    } catch (err) {
      closeSavingMessage()
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  render () {
    const { notes, editing } = this.state
    const { t, canEdit } = this.props

    return (
      <>
        <Row style={{marginLeft: '0px', height: 'calc(100% - 50px)'}}>
          {editing &&
            <Row style={{height: '100%', overflow: 'auto'}}>
              <NoteCKEditor initialData={notes} onChange={this.handleNotesChange} />
            </Row>}
          {!editing &&
            <div className='notes-content' style={{height: '100%', overflow: 'auto', padding: '20px'}} dangerouslySetInnerHTML={{__html: notes}} />}
        </Row>
        <Row style={{textAlign: 'right', marginRight: '20px', marginTop: '10px'}}>
          {editing &&
            <Button type='primary' onClick={this.saveNotes}>{t('Save')}</Button>}
          {(!editing && canEdit) &&
            <Button type='primary' onClick={this.startEditingNotes}>{t('Edit')}</Button>}
        </Row>
      </>
    )
  }
}
