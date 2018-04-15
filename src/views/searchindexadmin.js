// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import request from 'superagent'
import ConfirmationActions from '../actions/ConfirmationActions'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import type {LocaleStoreState} from '../stores/LocaleStore'
import UserStore from '../stores/UserStore'

const checkClientError = require('../services/client-error-response').checkClientError

type Props = {
  locale: string,
  connectionStatus: string,
  indexStatus: string,
  footerConfig: Object,
  headerConfig: Object,
  _csrf: string,
  user: Object
}

type State = LocaleStoreState

export default class SearchIndexAdmin extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  createIndex = () => {
    const _this = this
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm'),
      postitiveButtonText: this.__('Confirm'),
      negativeButtonText: this.__('Cancel'),
      message: this.__('Warning!'),
      onPositiveResponse () {
        request.post('/admin/searchindex/create')
          .type('json').accept('json')
          .send({
            _csrf: _this.state._csrf
          })
          .end((err, res) => {
            checkClientError(res, err, () => {}, (cb) => {
              if (err) {
                MessageActions.showMessage({title: _this.__('Server Error'), message: err})
              } else {
                NotificationActions.showNotification(
                  {
                    message: _this.__('Success'),
                    position: 'topright',
                    dismissAfter: 3000
                  })
              }
              cb()
            })
          })
      }
    })
  }

  deleteIndex = () => {
    const _this = this
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Delete'),
      postitiveButtonText: this.__('Confirm'),
      negativeButtonText: this.__('Cancel'),
      message: this.__('Warning!'),
      onPositiveResponse () {
        request.post('/admin/searchindex/delete')
          .type('json').accept('json')
          .send({
            _csrf: _this.state._csrf
          })
          .end((err, res) => {
            checkClientError(res, err, () => {}, (cb) => {
              if (err) {
                MessageActions.showMessage({title: _this.__('Server Error'), message: err})
              } else {
                NotificationActions.showNotification(
                  {
                    message: _this.__('Success'),
                    position: 'topright',
                    dismissAfter: 3000
                  })
              }
              cb()
            })
          })
      }
    })
  }

  rebuildFeatures = () => {
    const _this = this
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm'),
      postitiveButtonText: this.__('Confirm'),
      negativeButtonText: this.__('Cancel'),
      message: this.__('Warning this may take a long time, monitor the logs!'),
      onPositiveResponse () {
        request.post('/admin/searchindex/rebuild/features')
          .type('json').accept('json')
          .send({
            _csrf: _this.state._csrf
          })
          .end((err, res) => {
            checkClientError(res, err, () => {}, (cb) => {
              if (err) {
                MessageActions.showMessage({title: _this.__('Server Error'), message: err})
              } else {
                NotificationActions.showNotification(
                  {
                    message: _this.__('Success'),
                    position: 'topright',
                    dismissAfter: 3000
                  })
              }
              cb()
            })
          })
      }
    })
  }

  render () {
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container' style={{height: 'calc(100% - 100px)'}}>
          <div>
            <p><b>{this.__('Connection Status:')}</b> {this.props.connectionStatus}</p>
          </div>
          <div>
            <p><b>{this.__('Index Status:')}</b> {this.props.indexStatus}</p>
          </div>
          <div>
            <button className='btn' onClick={this.createIndex}>{this.__('Create Index')}</button>
          </div>
          <div>
            <button className='btn' onClick={this.deleteIndex}>{this.__('Delete Index')}</button>
          </div>
          <div>
            <button className='btn' onClick={this.rebuildFeatures}>{this.__('Rebuild Feature Index')}</button>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
