import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { message, notification } from 'antd'
import request from 'superagent'

import Reflux from '../src/components/Rehydrate'
import LocaleStore from '../src/stores/LocaleStore'
import type { LocaleStoreState } from '../src/stores/LocaleStore'
import ErrorBoundary from '../src/components/ErrorBoundary'
import UserStore from '../src/stores/UserStore'
import dynamic from 'next/dynamic'
const CodeEditor = dynamic(
  () => import('../src/components/LayerDesigner/CodeEditor'),
  {
    ssr: false
  }
)

const checkClientError =
  require('../services/client-error-response').checkClientError

type Props = {
  locale: string
  page_id: string
  pageConfig: Record<string, any>
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  _csrf: string
  user: Record<string, any>
}
type State = {
  pageConfig?: Record<string, any>
} & LocaleStoreState
export default class ConfigEdit extends React.Component<Props, State> {
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

  state: State

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

    this.state = {
      pageConfig: props.pageConfig
    }
  }

  savePageConfig: any | ((pageConfig: string) => void) = (
    pageConfig: string
  ) => {
    const { t, props, state, setState } = this
    const { page_id } = props
    const { _csrf } = state

    request
      .post('/api/page/save')
      .type('json')
      .accept('json')
      .send({
        page_id,
        pageConfig,
        _csrf
      })
      .end((err, res) => {
        checkClientError(
          res,
          err,
          () => {},
          (cb) => {
            setState({
              pageConfig: JSON.parse(pageConfig)
            })

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
          }
        )
      })
  }

  render(): JSX.Element {
    const { t, props, state, savePageConfig } = this
    const { page_id, headerConfig, footerConfig } = props
    const { pageConfig } = state
    return (
      <ErrorBoundary>
        <Header {...headerConfig} />
        <main
          className='container'
          style={{
            height: 'calc(100% - 100px)'
          }}
        >
          <CodeEditor
            id='layer-style-editor'
            mode='json'
            code={JSON.stringify(pageConfig, undefined, 2)}
            title={t('Editing Page Config: ') + page_id}
            onSave={savePageConfig}
            modal={false}
            visible
            t={t}
          />
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
