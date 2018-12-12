// @flow
import React from 'react'
import Editor from 'react-medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/flat.css'
import FeatureNotesStore from '../../stores/FeatureNotesStore'
import FeatureNotesActions from '../../actions/FeatureNotesActions'
import type {FeatureNotesStoreState} from '../../stores/FeatureNotesStore'

type Props = {|
  editing: boolean,
  t: Function
|}

export default class FeatureNotes extends React.Component<Props, FeatureNotesStoreState> {
  static defaultProps = {
    editing: false
  }

  stores: any

  constructor (props: Props) {
    super(props)
    this.stores = [FeatureNotesStore]
  }

  handleNotesChange = (notes: string) => {
    FeatureNotesActions.setNotes(notes)
  }

  render () {
    const {editing, t} = this.props
    let resources = ''
    if (editing) {
      resources = (
        <div className='row'>
          <Editor
            className='feature-notes'
            text={this.state.notes}
            onChange={this.handleNotesChange}
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
        </div>

      )
    } else {
      /* eslint-disable react/no-danger */
      resources = (
        <div className='feature-notes-content col s12 no-padding' dangerouslySetInnerHTML={{__html: this.state.notes}} />
      )
      /* eslint-enable react/no-danger */
    }

    return (
      <div className='row' style={{marginLeft: '0px'}}>
        {resources}
      </div>
    )
  }
}
