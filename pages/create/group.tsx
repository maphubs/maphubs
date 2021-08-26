import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Steps } from 'antd'
import Layout from '../../src/components/Layout'
import Step1 from '../../src/components/CreateGroup/Step1'
import Step2 from '../../src/components/CreateGroup/Step2'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import useT from '../../src/hooks/useT'

type State = {
  step: number
}
const CreateGroup = (): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const [step, setStep] = useState(1)

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Create Group')} hideFooter>
        <div className='container'>
          <h4>{t('Create Group')}</h4>
          <Steps size='small' current={step - 1}>
            <Steps.Step title={t('Group Info')} />
            <Steps.Step title={t('Group Logo')} />
            <Steps.Step title={t('Complete')} />
          </Steps>
          <Step1
            active={step === 1}
            onSubmit={() => {
              setStep(step + 1)
            }}
          />
          <Step2
            active={step === 2}
            showPrev
            onPrev={() => {
              setStep(step - 1)
            }}
            onSubmit={(groupId: string) => {
              router.push('/group/' + groupId)
            }}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default CreateGroup
