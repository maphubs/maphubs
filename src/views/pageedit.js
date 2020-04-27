// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { Row, Col, List, Button, Empty, message, notification } from 'antd'
import LocalizedCodeEditor from '../components/forms/LocalizedCodeEditor'
import request from 'superagent'
import shortid from 'shortid'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(() => import('../components/LayerDesigner/CodeEditor'), {
  ssr: false
})

const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  locale: string,
  page_id: string,
  pageConfig: Object,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

type State = {
  pageConfig?: Object,
  editingComponent?: Object
} & LocaleStoreState

export default class PageEdit extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    const pageConfig = props.pageConfig || {}
    if (!pageConfig.components) pageConfig.components = []
    pageConfig.components.map(c => {
      if (!c.id) c.id = shortid()
    })
    this.state = {
      pageConfig
    }
  }

  savePageConfig = (pageConfig: string) => {
    const {t} = this
    const _this = this
    request.post('/api/page/save')
      .type('json').accept('json')
      .send({
        page_id: this.props.page_id,
        pageConfig,
        _csrf: this.state._csrf
      })
      .end((err, res) => {
        checkClientError(res, err, () => {}, (cb) => {
          _this.setState({pageConfig: JSON.parse(pageConfig)})
          if (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.success(t('Page Saved'), 3)
          }
          cb()
        })
      })
  }

  updateComponent (component: Object) {
    const { pageConfig } = this.state
    pageConfig.components = pageConfig.components.map(c => {
      if (c.id === component.id) {
        return component
      } else {
        return c
      }
    })
    this.setState({pageConfig, editingComponent: null})
  }

  render () {
    const {t} = this
    const { pageConfig, editingComponent } = this.state
    const components = pageConfig.components
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main style={{height: 'calc(100% - 100px)', padding: '20px'}}>
          <Row style={{height: '100%'}}>
            <Col span={12} style={{height: '100%', padding: '20px'}}>
              <Row style={{height: '50%', overflow: 'auto'}}>
                <List
                  header={<b>Components</b>}
                  bordered
                  dataSource={components}
                  style={{width: '100%'}}
                  renderItem={(item) => (
                    <List.Item>
                      <Row style={{width: '100%'}}>
                        <Col span={8}>ID: {item.id}</Col>
                        <Col span={8}>Type: {item.type}</Col>
                        <Col span={8}>
                          <Button
                            type='primary' size='small' onClick={() => {
                              this.setState({editingComponent: item})
                            }}
                          >Edit
                          </Button>
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </Row>
              <Row style={{height: '50%'}}>
                <CodeEditor
                  ref='pageEditor' id='layer-style-editor' mode='json'
                  code={JSON.stringify(this.state.pageConfig, undefined, 2)}
                  title={t('Editing Page Config: ') + this.props.page_id}
                  onSave={this.savePageConfig} modal={false} visible
                  t={t}
                />
              </Row>
            </Col>
            <Col span={12} style={{height: '100%', padding: '20px'}}>
              <ErrorBoundary>
                <Row style={{height: '100%'}}>
                  {(editingComponent && editingComponent.type === 'html') &&
                    <LocalizedCodeEditor
                      id='component-html-editor'
                      mode='html'
                      localizedCode={editingComponent.html}
                      title={`Editing ${editingComponent.id}`}
                      onSave={(html) => {
                        editingComponent.html = html
                        this.updateComponent(editingComponent)
                      }}
                    />}
                  {(editingComponent && editingComponent.type !== 'html') &&
                    <CodeEditor
                      visible
                      id='component-config-editor'
                      mode='json'
                      code={JSON.stringify(editingComponent, undefined, 2)}
                      title={`Editing ${editingComponent.id}`}
                      onSave={(json) => {
                        this.updateComponent(editingComponent)
                      }} modal={false}
                      t={t}
                    />}
                  {!editingComponent &&
                    <Empty />}
                </Row>
              </ErrorBoundary>
            </Col>
          </Row>
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
