import React from 'react'
import { Steps } from 'antd'
import Header from '../components/header'
import Step1 from '../components/CreateGroup/Step1'
import Step2 from '../components/CreateGroup/Step2'

import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
const Step = Steps.Step
type Props = {
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  step: number
}
export default class CreateGroup extends React.Component<Props, State> {
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

  state: State = {
    step: 1
  }

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
  }

  onComplete: any | ((groupId: string) => void) = (groupId: string) => {
    window.location = '/group/' + groupId
  }
  nextStep: any | (() => void) = () => {
    this.setState({
      step: this.state.step + 1
    })
  }
  prevStep: any | (() => void) = () => {
    this.setState({
      step: this.state.step - 1
    })
  }

  render(): JSX.Element {
    const { t } = this
    const { step } = this.state
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <div className='container'>
          <h4>{t('Create Group')}</h4>
          <Steps size='small' current={step - 1}>
            <Step title={t('Group Info')} />
            <Step title={t('Group Logo')} />
            <Step title={t('Complete')} />
          </Steps>
          <Step1 active={step === 1} onSubmit={this.nextStep} />
          <Step2
            active={step === 2}
            showPrev
            onPrev={this.prevStep}
            onSubmit={this.onComplete}
          />
        </div>
      </ErrorBoundary>
    )
  }
}
