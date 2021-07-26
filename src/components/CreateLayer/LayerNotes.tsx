import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Row, Button, notification, message } from 'antd'
import request from 'superagent'

import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const debug = DebugService('stores/layer-notes')

const NoteCKEditor = dynamic(() => import('../forms/NoteCKEditor'), {
  ssr: false
})
type Props = {
  initialNotes?: string
  layer_id: number
  canEdit: boolean
}

const LayerNotes = ({
  initialNotes,
  layer_id,
  canEdit
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
    debug.log('save layer notes')
    const closeSavingMessage = message.loading(t('Saving'), 0)

    try {
      const res = await request
        .post('/api/layer/notes/save')
        .type('json')
        .accept('json')
        .send({
          layer_id,
          notes
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
        setEditing(false)
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

  return (
    <>
      <style jsx global>
        {`
          .notes-content p {
            font-size: 20px;
          }
          .notes-content ul {
            list-style: initial;
            font-size: 20px;
            padding-left: 40px;
          }
          .notes-content ul li {
            list-style-type: inherit;
          }
          .notes-content ol {
            font-size: 20px;
          }
          .notes-content a {
            color: ${process.env.NEXT_PUBLIC_PRIMARY_COLOR};
            text-decoration: underline;
          }
          .notes-content table {
            width: 80%;
            margin: auto auto;
          }
          .notes-content table th {
            border: 1px solid #323333;
            padding-left: 5px;
            background-color: #d9d9d9;
          }
          .notes-content table td {
            border: 1px solid #d9d9d9;
            padding-left: 5px;
          }

          .notes-content blockquote {
            overflow: hidden;
            padding-right: 1.5em;
            padding-left: 1.5em;
            margin-left: 0;
            font-style: italic;
            border-left: 5px solid #ccc;
          }

          .image {
            text-align: center;
          }

          .image img {
            max-width: 100%;
          }

          .image-style-side {
            float: right;
          }
        `}
      </style>
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
        align='middle'
        style={{
          textAlign: 'right',
          height: '50px',
          padding: '10px'
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
export default LayerNotes
