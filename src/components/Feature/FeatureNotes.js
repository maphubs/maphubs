// @flow
import type {Node} from "React";import React from 'react'
import dynamic from 'next/dynamic'
import { Row, Button, message, notification } from 'antd'
import request from 'superagent'

const NoteCKEditor = dynamic(() => import('../forms/NoteCKEditor.js'), {
  ssr: false
})

type Props = {|
  notes: string,
  canEdit: boolean,
  layer_id: number,
  mhid: string,
  _csrf: string,
  t: Function
|}

type State = {
  editing: boolean,
  notes: string,
  unsavedChanges?: boolean
}

export default class FeatureNotes extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      notes: props.notes || '',
      editing: false
    }
  }

  unloadHandler: any

  componentDidMount () {
    const _this = this
    this.unloadHandler = (e) => {
      if (_this.state.editing) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  saveNotes: (() => Promise<void>) = async () => {
    const { mhid, layer_id, _csrf, t } = this.props
    const closeSavingMessage = message.loading(t('Saving'), 0)
    try {
      await request.post('/api/feature/notes/save')
        .type('json').accept('json')
        .send({
          layer_id,
          mhid,
          notes: this.state.notes,
          _csrf
        })
      closeSavingMessage()
      this.setState({editing: false})
      message.info(t('Notes Saved'))
    } catch (err) {
      closeSavingMessage()
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  setNotes: ((notes: string) => void) = (notes: string) => {
    this.setState({notes, unsavedChanges: true})
  }

  startEditingNotes: (() => void) = () => {
    this.setState({editing: true})
  }

  render (): Node {
    const {setNotes, startEditingNotes, saveNotes} = this
    const {canEdit, t} = this.props
    const {editing, notes} = this.state

    return (
      <>
        <Row style={{marginLeft: '0px', height: 'calc(100% - 50px)'}}>
          {editing &&
            <Row style={{height: '100%', overflow: 'auto'}}>
              <NoteCKEditor initialData={notes} onChange={setNotes} />
            </Row>}
          {!editing &&
            <div className='notes-content' style={{height: '100%', overflow: 'auto', padding: '20px'}} dangerouslySetInnerHTML={{__html: notes}} />}
        </Row>
        <Row justify='end' style={{textAlign: 'right', marginRight: '20px', marginTop: '10px'}}>
          {editing &&
            <Button type='primary' onClick={saveNotes}>{t('Save')}</Button>}
          {(!editing && canEdit) &&
            <Button type='primary' onClick={startEditingNotes}>{t('Edit')}</Button>}
        </Row>
      </>
    )
  }
}
