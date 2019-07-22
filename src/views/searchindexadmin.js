// @flow
import React from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { message, notification } from 'antd'
import request from 'superagent'
import ConfirmationActions from '../actions/ConfirmationActions'
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
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
  }

  createIndex = () => {
    const {t} = this
    const _this = this
    ConfirmationActions.showConfirmation({
      title: t('Confirm'),
      postitiveButtonText: t('Confirm'),
      negativeButtonText: t('Cancel'),
      message: t('Warning!'),
      onPositiveResponse () {
        request.post('/admin/searchindex/create')
          .type('json').accept('json')
          .send({
            _csrf: _this.state._csrf
          })
          .end((err, res) => {
            checkClientError(res, err, () => {}, (cb) => {
              if (err) {
                notification.error({
                  message: t('Error'),
                  description: err.message || err.toString() || err,
                  duration: 0
                })
              } else {
                message.success(t('Success'))
              }
              cb()
            })
          })
      }
    })
  }

  deleteIndex = () => {
    const {t} = this
    const _this = this
    ConfirmationActions.showConfirmation({
      title: t('Confirm Delete'),
      postitiveButtonText: t('Confirm'),
      negativeButtonText: t('Cancel'),
      message: t('Warning!'),
      onPositiveResponse () {
        request.post('/admin/searchindex/delete')
          .type('json').accept('json')
          .send({
            _csrf: _this.state._csrf
          })
          .end((err, res) => {
            checkClientError(res, err, () => {}, (cb) => {
              if (err) {
                notification.error({
                  message: t('Error'),
                  description: err.message || err.toString() || err,
                  duration: 0
                })
              } else {
                message.success(t('Success'))
              }
              cb()
            })
          })
      }
    })
  }

  rebuildFeatures = () => {
    const {t} = this
    const _this = this
    ConfirmationActions.showConfirmation({
      title: t('Confirm'),
      postitiveButtonText: t('Confirm'),
      negativeButtonText: t('Cancel'),
      message: t('Warning this may take a long time, monitor the logs!'),
      onPositiveResponse () {
        request.post('/admin/searchindex/rebuild/features')
          .type('json').accept('json')
          .send({
            _csrf: _this.state._csrf
          })
          .end((err, res) => {
            checkClientError(res, err, () => {}, (cb) => {
              if (err) {
                notification.error({
                  message: t('Error'),
                  description: err.message || err.toString() || err,
                  duration: 0
                })
              } else {
                message.success(t('Success'))
              }
              cb()
            })
          })
      }
    })
  }

  render () {
    const {t} = this
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container' style={{height: 'calc(100% - 100px)'}}>
          <div>
            <p><b>{t('Connection Status:')}</b> {this.props.connectionStatus}</p>
          </div>
          <div>
            <p><b>{t('Index Status:')}</b> {this.props.indexStatus}</p>
          </div>
          <div>
            <button className='btn' onClick={this.createIndex}>{t('Create Index')}</button>
          </div>
          <div>
            <button className='btn' onClick={this.deleteIndex}>{t('Delete Index')}</button>
          </div>
          <div>
            <button className='btn' onClick={this.rebuildFeatures}>{t('Rebuild Feature Index')}</button>
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
