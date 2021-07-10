import React from 'react'
import { Steps } from 'antd'
import Header from '../src/components/header'
import Step1 from '../src/components/CreateGroup/Step1'
import Step2 from '../src/components/CreateGroup/Step2'
import ErrorBoundary from '../src/components/ErrorBoundary'

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

  onComplete: any | ((groupId: string) => void) = (groupId: string) => {
    window.location.assign('/group/' + groupId)
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
    const { t, props, state, nextStep, prevStep, onComplete } = this
    const { headerConfig } = props
    const { step } = state
    return (
      <ErrorBoundary t={t}>
        <Header {...headerConfig} />
        <div className='container'>
          <h4>{t('Create Group')}</h4>
          <Steps size='small' current={step - 1}>
            <Step title={t('Group Info')} />
            <Step title={t('Group Logo')} />
            <Step title={t('Complete')} />
          </Steps>
          <Step1 active={step === 1} onSubmit={nextStep} />
          <Step2
            active={step === 2}
            showPrev
            onPrev={prevStep}
            onSubmit={onComplete}
          />
        </div>
      </ErrorBoundary>
    )
  }
}
