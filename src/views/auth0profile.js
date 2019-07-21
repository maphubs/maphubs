// @flow
import React from 'react'
import Header from '../components/header'
// import Gravatar from '../components/user/Gravatar';
// import Password from '../components/forms/Password';
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'

type Props = {
  user: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

export default class Auth0Profile extends MapHubsComponent<Props, void> {
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

  render () {
    const {t} = this
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container'>
          <h5>{t('User Profile')}</h5>

          <div id='profile' className='col s12'>
            <p><b>{t('User Name')}: </b>{this.props.user.username}</p>
            <p><b>{t('Email')}: </b>{this.props.user.email}</p>
            <div>
              <img className='circle' style={{width: '250px', height: '250px'}} src={this.props.user.picture} />
            </div>
            <p>{t('More user profile settings coming soon!')}</p>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
