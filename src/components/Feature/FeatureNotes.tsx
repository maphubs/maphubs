import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Row, Button, message, notification } from 'antd'
import request from 'superagent'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
const NoteCKEditor = dynamic(() => import('../forms/NoteCKEditor'), {
  ssr: false
})
type Props = {
  initialNotes: string
  canEdit: boolean
  layer_id: number
  mhid: string
}

const FeatureNotes = ({
  initialNotes,
  canEdit,
  mhid,
  layer_id
}: Props): JSX.Element => {
  const { t } = useT()
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(initialNotes || '')

  useUnload((e) => {
    e.preventDefault()
    if (editing) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const saveNotes = async () => {
    const closeSavingMessage = message.loading(t('Saving'), 0)

    try {
      await request
        .post('/api/feature/notes/save')
        .type('json')
        .accept('json')
        .send({
          layer_id,
          mhid,
          notes
        })
      closeSavingMessage()
      setEditing(false)
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

  return (
    <>
      <Row
        style={{
          marginLeft: '0px',
          height: 'calc(100% - 50px)'
        }}
      >
        {editing && (
          <Row
            style={{
              height: '100%',
              overflow: 'auto'
            }}
          >
            <NoteCKEditor initialData={notes} onChange={setNotes} />
          </Row>
        )}
        {!editing && (
          <div
            className='notes-content'
            style={{
              height: '100%',
              overflow: 'auto',
              padding: '20px'
            }}
            dangerouslySetInnerHTML={{
              __html: notes
            }}
          />
        )}
      </Row>
      <Row
        justify='end'
        style={{
          textAlign: 'right',
          marginRight: '20px',
          marginTop: '10px'
        }}
      >
        {editing && (
          <Button type='primary' onClick={saveNotes}>
            {t('Save')}
          </Button>
        )}
        {!editing && canEdit && (
          <Button
            type='primary'
            onClick={() => {
              setEditing(true)
            }}
          >
            {t('Edit')}
          </Button>
        )}
      </Row>
    </>
  )
}
export default FeatureNotes
