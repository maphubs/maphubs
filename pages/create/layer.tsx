import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import slugify from 'slugify'
import { Steps, Row } from 'antd'
import Step1 from '../../src/components/CreateLayer/Step1'
import Step2 from '../../src/components/CreateLayer/Step2'
import Step3 from '../../src/components/CreateLayer/Step3'
import debugFactory from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import Layout from '../../src/components/Layout'
import type { Group } from '../../src/types/group'
import type { Layer } from '../../src/types/layer'

import ErrorBoundary from '../../src/components/ErrorBoundary'
import $ from 'jquery'
import { LocalizedString } from '../../src/types/LocalizedString'
import useUnload from '../../src/hooks/useUnload'
import useT from '../../src/hooks/useT'

//SSR Only
import knex from '../../src/connection'
import LayerModel from '../../src/models/layer'
import PageModel from '../../src/models/page'
import GroupModel from '../../src/models/group'

const debug = debugFactory('CreateLayer')
const Step = Steps.Step
type Props = {
  layer: Layer
  userGroups: Group[]
  mapConfig: Record<string, any>
  allowedToModifyLayer?: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return knex.transaction(async (trx) => {
    const session = await getSession(context)

    if (!session.user) {
      return {
        notFound: true
      }
    }

    const user_id = session.user.id || session.user.sub

    const layer_id = await LayerModel.createLayer(user_id, trx)
    const layer = await LayerModel.getLayerByID(layer_id, trx)

    layer.last_updated = layer.last_updated.toISOString()
    layer.creation_time = layer.creation_time.toISOString()

    const allowedToModifyLayer = await LayerModel.allowedToModify(
      layer_id,
      user_id
    )

    const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
    return {
      props: {
        layer,
        userGroups: await GroupModel.getGroupsForUser(user_id, trx),
        mapConfig,
        allowedToModifyLayer
      }
    }
  })
}
const CreateLayer = ({ layer, userGroups, mapConfig }: Props): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const [step, setStep] = useState(1)

  useUnload((e) => {
    e.preventDefault()
    if (layer.layer_id && layer.layer_id !== -1 && !layer.complete) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) {
        $.ajax({
          type: 'POST',
          url: '/api/layer/admin/delete',
          contentType: 'application/json;charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify({
            layer_id: layer.layer_id
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
    router.push('/layer/info/' + layerId + '/' + slugify(t(name)))
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  if (!userGroups || userGroups.length === 0) {
    return (
      <div>
        <Layout title={t('Create Layer')} hideFooter>
          <div className='container' style={{ height: '100%' }}>
            <Row
              align='middle'
              justify='center'
              style={{
                marginBottom: '20px',
                height: '100%'
              }}
            >
              <div style={{ width: '100%', textAlign: 'center' }}>
                <h2 style={{ width: '100%' }}>{t('Please Join a Group')}</h2>

                <p>
                  {t('Please create or join a group before creating a layer.')}
                </p>
              </div>
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
              {step === 2 && <Step2 groups={userGroups} onSubmit={nextStep} />}
              {step === 3 && <Step3 onSubmit={submit} mapConfig={mapConfig} />}
            </Row>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default CreateLayer
