// @flow
import React from 'react'
import MapHubsComponent from '../components/MapHubsComponent'
import Header from '../components/header'
import Footer from '../components/footer'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  locale: string,
  _csrf: string,
  requireInvite?: boolean,
  adminEmail: string,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

export default class Error extends MapHubsComponent<Props, void> {
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

  render () {
    const {t} = this
    let message = ''

    if (this.props.requireInvite) {
      message = (
        <p className='flow-text center-align'>{t('Accessing this site requires an invitation. Please contact us at ')}
          <a href={`mailto:${this.props.adminEmail}`}>{this.props.adminEmail}</a>
        </p>
      )
    } else {
      message = (
        <p className='flow-text center-align'>{t('We are having an issue finding your account. Please contact us at ')}
          <a href={`mailto:${this.props.adminEmail}`}>{this.props.adminEmail}</a>
        </p>
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container s12'>
            <h3 className='center-align'>{t('Unable to Access Account')}</h3>
            {message}
          </div>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
