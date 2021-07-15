import React, { useState } from 'react'
import slugify from 'slugify'
import { Steps, Row } from 'antd'
import Step1 from '../src/components/CreateLayer/Step1'
import Step2 from '../src/components/CreateLayer/Step2'
import Step3 from '../src/components/CreateLayer/Step3'
import debugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Layout from '../src/components/Layout'
import type { Group } from '../src/stores/GroupStore'
import type { Layer } from '../src/types/layer'
import type { LayerStoreState } from '../src/stores/layer-store'

import ErrorBoundary from '../src/components/ErrorBoundary'
import $ from 'jquery'
import getConfig from 'next/config'
import { LocalizedString } from '../src/types/LocalizedString'
import useUnload from '../src/hooks/useUnload'
import useT from '../src/hooks/useT'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const debug = debugFactory('CreateLayer')
const Step = Steps.Step
type Props = {
  groups: Array<Group>
  layer: Layer
}
type State = {
  step: number
} & LayerStoreState

const CreateLayer = () => {
  const { t } = useT()
  const [step, setStep] = useState(1)

  /*
    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }
    */

  useUnload((e) => {
    e.preventDefault()
    if (
      layerState.layer_id &&
      layerState.layer_id !== -1 &&
      !layerState.complete
    ) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) {
        $.ajax({
          type: 'POST',
          url: '/api/layer/admin/delete',
          contentType: 'application/json;charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify({
            layer_id: layerState.layer_id,
            _csrf: layerState._csrf
          }),
          async: false,

          success() {
            window.close()
          },

          error(msg) {
            debug.log(msg)
            window.close()
          }
        })
      }
    }
    window.close()
  })

  const submit = (layerId: number, name: LocalizedString) => {
    window.location.assign('/layer/info/' + layerId + '/' + slugify(t(name)))
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  if (!groups || groups.length === 0) {
    return (
      <div>
        <Layout title={t('Create Layer')} hideFooter>
          <div className='container'>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <h5>{t('Please Join a Group')}</h5>
              <p>
                {t('Please create or join a group before creating a layer.')}
              </p>
            </Row>
          </div>
        </Layout>
      </div>
    )
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Create Layer')} hideFooter>
        <div
          style={{
            height: '100%'
          }}
        >
          <div
            style={{
              marginLeft: '10px',
              marginRight: '10px',
              marginTop: '10px',
              height: '100%'
            }}
          >
            <Row
              style={{
                padding: '20px'
              }}
            >
              <Steps size='small' current={step - 1}>
                <Step title={t('Data')} />
                <Step title={t('Metadata')} />
                <Step title={t('Style')} />
                <Step title={t('Complete')} />
              </Steps>
            </Row>
            <Row
              style={{
                height: 'calc(100% - 65px)'
              }}
            >
              {step === 1 && (
                <Step1 onSubmit={nextStep} mapConfig={mapConfig} />
              )}
              {step === 2 && (
                <Step2
                  groups={groups}
                  showPrev
                  onPrev={prevStep}
                  onSubmit={nextStep}
                  t={t}
                />
              )}
              {step === 3 && <Step3 onSubmit={submit} mapConfig={mapConfig} />}
            </Row>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default CreateLayer
