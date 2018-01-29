// @flow
import React from 'react'
import MapHubsComponent from '../components/MapHubsComponent'
import Header from '../components/header'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'

type Props = {
  title: string,
  error: string,
  url: string,
  locale: string,
  _csrf: string,
  eventId: string,
  headerConfig: Object
}

export default class Error extends MapHubsComponent<Props, void> {
  props: Props

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
  }

  componentDidMount () {
    if (Raven.isSetup() && this.props.eventId) {
      Raven.showReportDialog({eventId: this.props.eventId})
    }
  }

  render () {
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container s12'>
            <h3 className='center-align'>{this.props.title}</h3>
            <p className='flow-text center-align'>{this.props.error}</p>
            <p className='flow-text center-align'><a href={this.props.url} target='_blank' rel='noopener noreferrer'>{this.props.url}</a></p>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
