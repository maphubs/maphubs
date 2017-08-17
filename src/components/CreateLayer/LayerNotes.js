//@flow
import React from 'react';
import Editor from 'react-medium-editor';
import LayerNotesStore from '../../stores/LayerNotesStore';
import LayerNotesActions from '../../actions/LayerNotesActions';
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  editing: boolean
|}

type DefaultProps = {
  editing: boolean
}

import type {LayerNotesStoreState} from '../../stores/LayerNotesStore';


export default class LayerNotes extends MapHubsComponent<Props, LayerNotesStoreState> {

  static defaultProps: DefaultProps = {
    editing: false
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerNotesStore);
  }

  handleNotesChange = (notes: string) => {
    LayerNotesActions.setNotes(notes);
  }

  render(){
    var resources = '';
    if(this.props.editing){
      resources = (
          <div className="row no-margin"  style={{height: '100%', overflow: 'auto'}}>
              <Editor
               className="notes-content"
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
            <div className="notes-content col s12 no-padding" style={{height: '100%', overflow: 'auto'}} dangerouslySetInnerHTML={{__html: this.state.notes}}></div>
      );
      /*eslint-enable react/no-danger*/
    }

    return (
      <div className="row no-margin" style={{marginLeft: '0px', height: 'calc(100% - 25px)'}}>
        {resources}
      </div>
    );
  }
}