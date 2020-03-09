import React from 'react'
import Formsy from 'formsy-react'
import Header from '../components/header'
import SelectGroup from '../components/Groups/SelectGroup'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import FileUpload from '../components/forms/FileUpload'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import { Steps, Row, notification, message, Button } from 'antd'

const Step = Steps.Step

type Props = {|
  groups: Array,
  locale: string,
  headerConfig: Object,
  user: Object
|}

type State = {
  layer_id?: number,
  group_id?: string
}

export default class ImportLayer extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    groups: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  componentDidMount () {
    const {t} = this
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.state.group_id && !_this.state.layer_id) {
        const msg = t('You have not finished importing your layer.')
        e.returnValue = msg
        return msg
      }
    })
  }

  onGroupChange = (groupId: string) => {
    this.setState({group_id: groupId})
  }

  onUpload = (result: Object) => {
    const {t} = this
    this.closeProcessingMessage()
    if (result.success) {
      this.setState({layer_id: result.layer_id})
    } else {
      notification.error({
        message: t('Error'),
        description: result.error,
        duration: 0
      })
    }
  }

  onUploadError = (err: string) => {
    const {t} = this
    notification.error({
      message: t('Error'),
      description: err,
      duration: 0
    })
  }

  onProcessingStart = () => {
    this.closeProcessingMessage = message.loading(this.t('Loading Data'), 0)
  }

  render () {
    const {t} = this
    if (!this.props.groups || this.props.groups.length === 0) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <Row style={{marginBottom: '20px'}}>
                <h5>{t('Please Join a Group')}</h5>
                <p>{t('Please create or join a group before creating a layer.')}</p>
              </Row>
            </div>
          </main>
        </ErrorBoundary>
      )
    }
    let step = 0
    let groupSelection
    if (!this.state.group_id) {
      groupSelection = (
        <Row style={{marginBottom: '10px', maxWidth: '400px'}}>
          <Formsy>
            <SelectGroup groups={this.props.groups} onGroupChange={this.onGroupChange} type='layer' />
          </Formsy>
        </Row>
      )
    }

    let importComplete
    if (this.state.layer_id) {
      step = 2
      importComplete = (
        <Row>
          <p>{t('Import Complete')}</p>
          <Button type='primary' href={`/lyr/${this.state.layer_id}`}>{t('Go to Layer')}</Button>
        </Row>
      )
    }

    let uploadBox
    if (this.state.group_id && !this.state.layer_id) {
      step = 1
      const url = `/api/import/layer/${this.state.group_id}/upload`
      uploadBox = (
        <Row>
          <p>{t('Please upload a MapHubs (.maphubs) file')}</p>
          <FileUpload onUpload={this.onUpload} onFinishTx={this.onProcessingStart} onError={this.onUploadError} action={url} />
        </Row>
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container' style={{paddingTop: '20px'}}>
            <Row>
              <Steps size='small' current={step}>
                <Step title='Group' />
                <Step title='Upload' />
                <Step title='Finished' />
              </Steps>
            </Row>
            <Row style={{textAlign: 'center', paddingTop: '20px'}}>
              {groupSelection}
              {uploadBox}
              {importComplete}
            </Row>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
