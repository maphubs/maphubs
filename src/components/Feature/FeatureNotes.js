// @flow
import React from 'react'
import { message } from 'antd'
import Editor from 'react-medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/flat.css'
import MessageActions from '../../actions/MessageActions'
import EditButton from '../EditButton'
import request from 'superagent'

type Props = {|
  notes: string,
  canEdit: boolean,
  layer_id: number,
  mhid: string,
  _csrf: string,
  t: Function
|}

type State = {
  editingNotes: boolean,
  notes: string,
  unsavedChanges?: boolean,
  saving?: boolean
}

export default class FeatureNotes extends React.Component<Props, State> {
  static defaultProps = {
    canEdit: false
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      notes: props.notes || '',
      editingNotes: false
    }
  }

  editButton: any

  componentDidMount () {
    const {t} = this.props
    const {editingNotes} = this.state
    window.addEventListener('beforeunload', (e) => {
      if (editingNotes) {
        const msg = t('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  saveNotes = async () => {
    const { mhid, layer_id, _csrf, t } = this.props
    this.setState({saving: true})
    try {
      await request.post('/api/feature/notes/save')
        .type('json').accept('json')
        .send({
          layer_id,
          mhid,
          notes: this.state.notes,
          _csrf
        })
      this.setState({saving: false, editingNotes: false})
      message.info(t('Notes Saved'))
    } catch (err) {
      this.setState({saving: false})
      MessageActions.showMessage({title: t('Server Error'), message: err.message || err.toString()})
    }
  }

  setNotes = (notes: string) => {
    this.setState({notes, unsavedChanges: true})
  }

  startEditingNotes = () => {
    this.setState({editingNotes: true})
  }

  render () {
    const {setNotes, startEditingNotes, saveNotes} = this
    const {canEdit, t} = this.props
    const {editingNotes, notes} = this.state
    let resources = ''
    if (editingNotes) {
      resources = (
        <Editor
          className='feature-notes'
          text={notes}
          style={{height: '100%'}}
          onChange={setNotes}
          options={{
            buttonLabels: 'fontawesome',
            delay: 100,
            placeholder: {text: t('Enter text, links to webpages, links to documents (from Dropbox, Google Docs, etc.)')},
            toobar: {
              buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'quote', 'orderedlist', 'unorderedlist', 'pre', 'removeFormat']
            },
            paste: {
              forcePlainText: false,
              cleanPastedHTML: true
            },
            autoLink: true,
            imageDragging: false
          }}
        />
      )
    } else {
      /* eslint-disable react/no-danger */
      resources = (
        <div className='feature-notes-content col s12 no-padding' dangerouslySetInnerHTML={{__html: notes || ''}} />
      )
      /* eslint-enable react/no-danger */
    }

    return (
      <div className='row' style={{marginLeft: '0px', padding: '20px', height: '100%'}}>
        {resources}
        {canEdit &&
          <EditButton editing={editingNotes}
            style={{position: 'absolute'}}
            startEditing={startEditingNotes} stopEditing={saveNotes} />
        }
      </div>
    )
  }
}
