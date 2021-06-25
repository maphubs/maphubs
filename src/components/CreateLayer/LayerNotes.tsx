import React from 'react'
import dynamic from 'next/dynamic'
import { Row, Button, notification, message } from 'antd'
import request from 'superagent'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')(
  'stores/layer-notes'
)

const NoteCKEditor = dynamic(() => import('../forms/NoteCKEditor.js'), {
  ssr: false
})
type Props = {
  notes?: string
  t: (...args: Array<any>) => any
  layer_id: number
  canEdit: boolean
  _csrf?: string
}
type State = {
  editing: boolean
  notes: string
  unsavedChanges?: boolean
}
export default class LayerNotes extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      editing: false,
      notes: props.notes || ''
    }
  }

  unloadHandler: any

  componentDidMount() {
    const _this = this

    this.unloadHandler = (e) => {
      if (_this.state.editing) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  startEditingNotes: () => void = () => {
    this.setState({
      editing: true
    })
  }
  handleNotesChange: (notes: string) => void = (notes: string) => {
    this.setState({
      notes,
      unsavedChanges: true
    })
  }
  saveNotes: () => Promise<void> = async () => {
    debug.log('save layer notes')
    const { t, layer_id, _csrf } = this.props
    const { notes } = this.state
    const closeSavingMessage = message.loading(t('Saving'), 0)

    try {
      const res = await request
        .post('/api/layer/notes/save')
        .type('json')
        .accept('json')
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
        this.setState({
          editing: false,
          unsavedChanges: false
        })
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

  render(): JSX.Element {
    const { notes, editing } = this.state
    const { t, canEdit } = this.props
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
              color: ${MAPHUBS_CONFIG.primaryColor};
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
              <NoteCKEditor
                initialData={notes}
                onChange={this.handleNotesChange}
              />
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
            <Button type='primary' onClick={this.saveNotes}>
              {t('Save')}
            </Button>
          )}
          {!editing && canEdit && (
            <Button type='primary' onClick={this.startEditingNotes}>
              {t('Edit')}
            </Button>
          )}
        </Row>
      </>
    )
  }
}
