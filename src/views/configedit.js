// @flow
import type {Node} from "React";import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { message, notification } from 'antd'
import request from 'superagent'
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
  pageConfig?: Object
} & LocaleStoreState

export default class ConfigEdit extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}): Promise<any> {
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
    this.state = {
      pageConfig: props.pageConfig
    }
  }

  savePageConfig: any | ((pageConfig: string) => void) = (pageConfig: string) => {
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

  render (): Node {
    const {t} = this
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container' style={{height: 'calc(100% - 100px)'}}>
          <CodeEditor
            id='layer-style-editor' mode='json'
            code={JSON.stringify(this.state.pageConfig, undefined, 2)}
            title={t('Editing Page Config: ') + this.props.page_id}
            onSave={this.savePageConfig} modal={false} visible
            t={t}
          />
        </main>
        <Footer t={t} {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
