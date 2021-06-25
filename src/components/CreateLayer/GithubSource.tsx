import React from 'react'
import { Row, Button } from 'antd'
import Formsy from 'formsy-react'
import TextInput from '../forms/textInput'
import LayerStore from '../../stores/layer-store'

type Props = {
  onSubmit: (...args: Array<any>) => any
  active: boolean
}
type DefaultProps = {
  active: boolean
}
type State = {
  canSubmit: boolean
  selectedSource?: string
}
export default class GithubSource extends React.Component<Props, State> {
  propss: Props
  static defaultProps: DefaultProps = {
    active: false
  }
  state: State = {
    canSubmit: false
  }

  constructor(props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  enableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
  }
  submit: any | ((model: any) => void) = (model: Record<string, any>) => {
    // #TODO:180 save step 2 to DB
    this.props.onSubmit(model)
  }
  sourceChange: any | ((value: string) => void) = (value: string) => {
    this.setState({
      selectedSource: value
    })
  }

  render(): JSX.Element {
    const { t } = this
    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Formsy
          onValidSubmit={this.submit}
          onValid={this.enableButton}
          onInvalid={this.disableButton}
        >
          <div>
            <p>Github GeoJSON Source</p>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <TextInput
                name='githuburl'
                label='Github GeoJSON URL'
                icon='info'
                validations='maxLength:100'
                validationErrors={{
                  maxLength: 'Must be 100 characters or less.'
                }}
                length={100}
                tooltipPosition='top'
                tooltip='Github GeoJSON URL'
                required
                t={t}
              />
            </Row>
          </div>
          <div
            style={{
              float: 'right'
            }}
          >
            <Button
              type='primary'
              htmlType='submit'
              disabled={!this.state.canSubmit}
            >
              Save and Continue
            </Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
