// @flow
import React from 'react'
import { Row } from 'antd'
import Formsy from 'formsy-react'
import TextInput from '../forms/textInput'
import LayerStore from '../../stores/layer-store'
import MapHubsComponent from '../MapHubsComponent'

type Props = {|
  onSubmit: Function,
  active: boolean
|}

type DefaultProps = {
  active: boolean
}

type State = {
  canSubmit: boolean,
  selectedSource?: string
}

export default class GithubSource extends MapHubsComponent<Props, State> {
  propss: Props

  static defaultProps: DefaultProps = {
    active: false
  }

  state: State = {
    canSubmit: false
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  submit = (model: Object) => {
    // #TODO:180 save step 2 to DB
    this.props.onSubmit(model)
  }

  sourceChange = (value: string) => {
    this.setState({selectedSource: value})
  }

  render () {
    return (
      <Row>
        <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>

          <div>
            <p>Github GeoJSON Source</p>
            <Row>
              <TextInput
                name='githuburl' label='Github GeoJSON URL' icon='info' className='col s12' validations='maxLength:100' validationErrors={{
                  maxLength: 'Must be 100 characters or less.'
                }} length={100}
                dataPosition='top' dataTooltip='Github GeoJSON URL'
                required />
            </Row>
          </div>
          <div className='right'>
            <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>Save and Continue</button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
