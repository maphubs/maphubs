import React from 'react'
import { Row, Button } from 'antd'
import Formsy from 'formsy-react'
import TextInput from '../forms/textInput'
import LayerStore from '../../stores/layer-store'

type Props = {
  onSubmit: (...args: Array<any>) => void
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

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
  }

  enableButton = (): void => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = (): void => {
    this.setState({
      canSubmit: false
    })
  }
  submit = (model: Record<string, any>): void => {
    // #TODO:180 save step 2 to DB
    this.props.onSubmit(model)
  }
  sourceChange = (value: string): void => {
    this.setState({
      selectedSource: value
    })
  }

  render(): JSX.Element {
    const { t, state, submit, enableButton, disableButton } = this
    const { canSubmit } = state
    return (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Formsy
          onValidSubmit={submit}
          onValid={enableButton}
          onInvalid={disableButton}
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
            <Button type='primary' htmlType='submit' disabled={!canSubmit}>
              Save and Continue
            </Button>
          </div>
        </Formsy>
      </Row>
    )
  }
}
