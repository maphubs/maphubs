import React from 'react'
import Formsy from 'formsy-react'
import Header from '../src/components/header'
import SelectGroup from '../src/components/Groups/SelectGroup'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import FileUpload from '../src/components/forms/FileUpload'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import { Steps, Row, Col, notification, message, Button } from 'antd'
const Step = Steps.Step
type Props = {
  groups: Array<Record<string, any>>
  locale: string
  headerConfig: Record<string, any>
  user: Record<string, any>
  _csrf: string
}
type State = {
  layer_id?: number
  map_id?: number
  group_id?: string
}
export default class ImportLayer extends React.Component<Props, State> {
  closeProcessingMessage: any
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps:
    | any
    | {
        groups: Array<any>
      } = {
    groups: []
  }

  constructor(props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }
  }

  unloadHandler: any

  componentDidMount(): void {
    const { state, unloadHandler } = this
    const { group_id, layer_id, map_id } = state

    this.unloadHandler = (e) => {
      if (group_id && !(layer_id || map_id)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', unloadHandler)
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  onGroupChange = (groupId: string): void => {
    this.setState({
      group_id: groupId
    })
  }
  onUpload = (result: Record<string, any>): void => {
    const { t } = this
    this.closeProcessingMessage()

    if (result.success) {
      message.success(t('Import Complete'))
      this.setState({
        layer_id: result.layer_id,
        map_id: result.map_id
      })
    } else {
      notification.error({
        message: t('Error'),
        description: result.error,
        duration: 0
      })
    }
  }
  onProcessingStart = (): void => {
    this.closeProcessingMessage = message.loading(this.t('Loading Data'), 0)
  }

  render(): JSX.Element {
    const { t, props, state, onUpload, onProcessingStart, onGroupChange } = this
    const { groups, headerConfig } = props
    const { group_id, layer_id, map_id } = state

    if (!groups || groups.length === 0) {
      return (
        <ErrorBoundary>
          <Header {...headerConfig} />
          <main>
            <div className='container'>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <h5>{t('Please Join a Group')}</h5>
                <p>
                  {t('Please create or join a group before creating a layer.')}
                </p>
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
        <Header {...headerConfig} />
        <main>
          <div
            className='container'
            style={{
              paddingTop: '20px'
            }}
          >
            <Row>
              <Steps size='small' current={step}>
                <Step title={t('Group')} />
                <Step title={t('Upload')} />
                <Step title={t('Finished')} />
              </Steps>
            </Row>
            <Row
              style={{
                padding: '40px'
              }}
            >
              {step === 0 && (
                <Row
                  justify='center'
                  style={{
                    marginBottom: '10px'
                  }}
                >
                  <Col>
                    <Formsy>
                      <SelectGroup
                        groups={groups}
                        onGroupChange={onGroupChange}
                      />
                    </Formsy>
                  </Col>
                </Row>
              )}
              {step === 1 && (
                <Row
                  justify='center'
                  align='middle'
                  style={{
                    height: '100%'
                  }}
                >
                  <Col span={8}>
                    <p>{t('Please upload a MapHubs (.maphubs) file')}</p>
                  </Col>
                  <Col span={16}>
                    <FileUpload
                      onUpload={onUpload}
                      beforeUpload={onProcessingStart}
                      action={`/api/import/${group_id || ''}/upload`}
                      t={t}
                    />
                  </Col>
                </Row>
              )}
              {step === 2 && (
                <Row
                  justify='center'
                  align='middle'
                  style={{
                    height: '100%'
                  }}
                >
                  <Col span={8}>
                    <p>{t('Import Complete')}</p>
                  </Col>
                  <Col span={16}>
                    {layer_id && (
                      <Button type='primary' href={`/lyr/${layer_id}`}>
                        {t('Go to Layer')}
                      </Button>
                    )}
                    {map_id && (
                      <Button type='primary' href={`/map/view/${map_id}/`}>
                        {t('Go to Map')}
                      </Button>
                    )}
                  </Col>
                </Row>
              )}
            </Row>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
