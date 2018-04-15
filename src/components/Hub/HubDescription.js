// @flow
import React from 'react'
import Editor from 'react-medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/flat.css'
import HubStore from '../../stores/HubStore'
import HubActions from '../../actions/HubActions'
import _isequal from 'lodash.isequal'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {HubStoreState} from '../../stores/HubStore'

type Props = {|
  hubid: string,
  editing: boolean,
  subPage: boolean
|}

type DefaultProps = {
  editing: boolean,
  subPage: boolean
}

export default class HubDescription extends MapHubsComponent<Props, HubStoreState> {
  props: Props

  static defaultProps: DefaultProps = {
    editing: false,
    subPage: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(HubStore)
  }

  shouldComponentUpdate (nextProps: Props, nextState: HubStoreState) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  handleDescriptionChange = (desc: string) => {
    HubActions.setDescription(desc)
  }

  render () {
    let description = ''
    let descriptionVal = null
    if (this.state.hub.description) descriptionVal = this.state.hub.description.replace('&nbsp;', '')
    if (this.props.editing) {
      description = (
        <div className='container'>
          <div className='row'>
            <div className='flow-text'>
              <Editor
                tag='p'
                text={descriptionVal}
                onChange={this.handleDescriptionChange}
                options={{toolbar: false,
                  buttonLabels: false,
                  placeholder: {text: this.__('Enter a Description or Intro for Your Hub')},
                  disableReturn: true,
                  buttons: []}}
              />
            </div>
          </div>
        </div>
      )
    } else {
      description = (
        <div className='container'>
          <div className='row'>
            <p className='flow-text hub-description'>{descriptionVal}</p>
          </div>
        </div>
      )
    }

    if (this.props.subPage) {
      description = ''
    }

    return (
      <div>
        {description}
      </div>
    )
  }
}
