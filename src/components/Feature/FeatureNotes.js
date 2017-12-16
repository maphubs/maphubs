//@flow
import React from 'react';
import Editor from 'react-medium-editor';
import FeatureNotesStore from '../../stores/FeatureNotesStore';
import FeatureNotesActions from '../../actions/FeatureNotesActions';
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  editing: boolean
|}

import type {FeatureNotesStoreState} from '../../stores/FeatureNotesStore';

export default class FeatureNotes extends MapHubsComponent<Props, FeatureNotesStoreState> {

  props: Props

  static defaultProps = {
    editing: false
  }

  constructor(props: Props){
    super(props);
    this.stores.push(FeatureNotesStore);
  }

  handleNotesChange = (notes: string) => {
    FeatureNotesActions.setNotes(notes);
  }

  render(){
    let resources = '';
    if(this.props.editing){
      resources = (
          <div className="row">
              <Editor
               className="feature-notes"
               text={this.state.notes}
               onChange={this.handleNotesChange}
               options={{
                 buttonLabels: 'fontawesome',
                 delay: 100,
                 placeholder: {text: this.__('Enter text, links to webpages, links to documents (from Dropbox, Google Docs, etc.)')},
                 toobar:{
                   buttons: ['bold', 'italic', 'underline', 'anchor', 'h5', 'quote','orderedlist','unorderedlist', 'pre','removeFormat']
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

      );
    }else{
      /*eslint-disable react/no-danger*/
      resources = (
            <div className="feature-notes-content col s12 no-padding" dangerouslySetInnerHTML={{__html: this.state.notes}}></div>
      );
      /*eslint-enable react/no-danger*/
    }

    return (
      <div className="row" style={{marginLeft: '0px'}}>
        {resources}
      </div>
    );
  }

}