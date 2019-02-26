// @flow
import React from 'react'
import Editor from 'react-medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/flat.css'
import FeatureNotesStore from '../../stores/FeatureNotesStore'
import FeatureNotesActions from '../../actions/FeatureNotesActions'
import MessageActions from '../../actions/MessageActions'
import NotificationActions from '../../actions/NotificationActions'
import type {FeatureNotesStoreState} from '../../stores/FeatureNotesStore'
import HubEditButton from '../Hub/HubEditButton'
import MapHubsComponent from '../MapHubsComponent'

type Props = {|
  canEdit: boolean,
  layer_id: number,
  mhid: string
|}

type State = {
  editingNotes: boolean
} & LocaleStoreState & FeatureNotesStoreState

export default class FeatureNotes extends MapHubsComponent<Props, State> {
  static defaultProps = {
    canEdit: false
  }

  editButton: any

  constructor (props: Props) {
    super(props)
    this.stores.push(FeatureNotesStore)
  }

  componentDidMount () {
    const {t} = this
    const {editingNotes} = this.state
    window.addEventListener('beforeunload', (e) => {
      if (editingNotes) {
        const msg = t('You have not saved your edits, your changes will be lost.')
        e.returnValue = msg
        return msg
      }
    })
  }

  handleNotesChange = (notes: string) => {
    FeatureNotesActions.setNotes(notes)
  }

  startEditingNotes = () => {
    this.setState({editingNotes: true})
  }

  stopEditingNotes = () => {
    const _this = this
    const {t} = this

    FeatureNotesActions.saveNotes(this.props.layer_id, this.props.mhid, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Server Error'), message: err})
      } else {
        NotificationActions.showNotification({message: t('Notes Saved')})
        _this.setState({editingNotes: false})
      }
    })
  }

  render () {
    const {t, handleNotesChange, startEditingNotes, stopEditingNotes} = this
    const {canEdit} = this.props
    const {editingNotes, notes} = this.state
    let resources = ''
    if (editingNotes) {
      resources = (
        <Editor
          className='feature-notes'
          text={notes}
          style={{height: '100%'}}
          onChange={handleNotesChange}
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
          <HubEditButton editing={editingNotes}
            style={{position: 'absolute'}}
            startEditing={startEditingNotes} stopEditing={stopEditingNotes} />
        }
      </div>
    )
  }
}
