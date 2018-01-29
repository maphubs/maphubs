// @flow
import React from 'react'
import Header from '../components/header'
import Step1 from '../components/CreateGroup/Step1'
import Step2 from '../components/CreateGroup/Step2'
import classNames from 'classnames'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'

type Props = {
  locale: string,
  _csrf: string,
  headerConfig: Object
}

type State = {
  step: number
}

export default class CreateGroup extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    step: 1
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
  }

  onComplete = (groupId: string) => {
    window.location = '/group/' + groupId
  }

  nextStep = () => {
    this.setState({step: this.state.step + 1})
  }

  prevStep = () => {
    this.setState({step: this.state.step - 1})
  }

  render () {
    const stepText = this.__('Step') + ' ' + this.state.step
    let progressWidth = ''
    let step1 = false
    let step2 = false
    switch (this.state.step) {
      case 1:
        progressWidth = 'width-50'
        step1 = true
        break
      case 2:
        progressWidth = 'width-full'
        step2 = true
        break
      default:
        break
    }
    const progressClassName = classNames('determinate', progressWidth)

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <div className='container'>
          <h4>{this.__('Create Group')}</h4>
          <div className='row center'>
            <b>{stepText}</b>

            <div className='progress'>
              <div className={progressClassName} />
            </div>
          </div>
          <Step1 active={step1} onSubmit={this.nextStep} />
          <Step2 active={step2} showPrev onPrev={this.prevStep} onSubmit={this.onComplete} />
        </div>
      </ErrorBoundary>
    )
  }
}
