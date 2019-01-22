// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import CodeEditor from '../components/LayerDesigner/CodeEditor'
import request from 'superagent'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

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
    this.state = {
      pageConfig: props.pageConfig
    }
  }

  componentDidMount () {
    this.refs.pageEditor.show()
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
            MessageActions.showMessage({title: t('Server Error'), message: err})
          } else {
            NotificationActions.showNotification(
              {
                message: t('Page Saved'),
                position: 'topright',
                dismissAfter: 3000
              })
          }
          cb()
        })
      })
  }

  render () {
    const {t} = this
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container' style={{height: 'calc(100% - 100px)'}}>
          <CodeEditor ref='pageEditor' id='layer-style-editor' mode='json'
            code={JSON.stringify(this.state.pageConfig, undefined, 2)}
            title={t('Editing Page Config: ') + this.props.page_id}
            onSave={this.savePageConfig} modal={false} />
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
