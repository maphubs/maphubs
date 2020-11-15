// @flow
import type {Node} from "React";import React from 'react'
import Formsy from 'formsy-react'
import Header from '../components/header'
import SelectGroup from '../components/Groups/SelectGroup'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import FileUpload from '../components/forms/FileUpload'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import { Steps, Row, Col, notification, message, Button } from 'antd'

const Step = Steps.Step

type Props = {|
  groups: Array<Object>,
  locale: string,
  headerConfig: Object,
  user: Object,
  _csrf: string
|}

type State = {
  layer_id?: number,
  map_id?: number,
  group_id?: string
}

export default class ImportLayer extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps: any | {|groups: Array<any>|} = {
    groups: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  unloadHandler: any

  componentDidMount () {
    const _this = this
    this.unloadHandler = (e) => {
      if (_this.state.group_id && !(_this.state.layer_id || _this.state.map_id)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  onGroupChange: any | ((groupId: string) => void) = (groupId: string) => {
    this.setState({group_id: groupId})
  }

  onUpload: any | ((result: any) => void) = (result: Object) => {
    const {t} = this
    this.closeProcessingMessage()
    if (result.success) {
      message.success(t('Import Complete'))
      this.setState({layer_id: result.layer_id, map_id: result.map_id})
    } else {
      notification.error({
        message: t('Error'),
        description: result.error,
        duration: 0
      })
    }
  }

  onProcessingStart: any | (() => void) = () => {
    this.closeProcessingMessage = message.loading(this.t('Loading Data'), 0)
  }

  render (): Node {
    const {t} = this
    const { groups } = this.props
    const { group_id, layer_id, map_id } = this.state

    if (!groups || groups.length === 0) {
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
    if (layer_id || map_id) {
      step = 2
    } else if (group_id) {
      step = 1
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container' style={{paddingTop: '20px'}}>
            <Row>
              <Steps size='small' current={step}>
                <Step title={t('Group')} />
                <Step title={t('Upload')} />
                <Step title={t('Finished')} />
              </Steps>
            </Row>
            <Row style={{padding: '40px'}}>
              {step === 0 &&
                <Row justify='center' style={{marginBottom: '10px'}}>
                  <Col>
                    <Formsy>
                      <SelectGroup groups={groups} onGroupChange={this.onGroupChange} type='layer' />
                    </Formsy>
                  </Col>
                </Row>}
              {step === 1 &&
                <Row justify='center' align='middle' style={{height: '100%'}}>
                  <Col span={8}>
                    <p>{t('Please upload a MapHubs (.maphubs) file')}</p>
                  </Col>
                  <Col span={16}>
                    <FileUpload
                      onUpload={this.onUpload} beforeUpload={this.onProcessingStart}
                      action={`/api/import/${group_id || ''}/upload`} t={t}
                    />
                  </Col>
                </Row>}
              {step === 2 &&
                <Row justify='center' align='middle' style={{height: '100%'}}>
                  <Col span={8}>
                    <p>{t('Import Complete')}</p>
                  </Col>
                  <Col span={16}>
                    {layer_id &&
                      <Button type='primary' href={`/lyr/${layer_id}`}>{t('Go to Layer')}</Button>}
                    {map_id &&
                      <Button type='primary' href={`/map/view/${map_id}/`}>{t('Go to Map')}</Button>}
                  </Col>
                </Row>}
            </Row>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
