import React from 'react'
import { Layout, Row, Button, Card } from 'antd'
import useT from '../src/hooks/useT'

const VerifyEmail = (): JSX.Element => {
  const { t } = useT()
  let email = ''
  let token = ''

  if (typeof location !== 'undefined') {
    const url = new URL(location.href)
    email = url.searchParams.get('email')
    token = url.searchParams.get('token')
  }

  return (
    <Layout
      title='Verify Email - MapHubs'
      style={{
        height: '100vh',
        width: '100vw'
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        <Row
          align='middle'
          justify='center'
          style={{
            height: '200px',
            width: '100%'
          }}
        >
          <img
            height='100px'
            src='assets/maphubs-logo.png'
            alt='MapHubs Logo'
          />
        </Row>
        <Row
          align='middle'
          justify='center'
          style={{
            width: '100%'
          }}
        >
          <Card
            title={t('Email Verified')}
            style={{
              width: '325px'
            }}
          >
            <p>{email}</p>

            <Button
              type='primary'
              style={{
                width: '100%'
              }}
              onClick={() => {
                window.location.href = `/api/auth/callback/email?email=${encodeURIComponent(
                  email || ''
                )}&token=${encodeURIComponent(token || '')}`
              }}
            >
              {t('Continue to')}
              {` ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`}
            </Button>
          </Card>
        </Row>
      </div>
    </Layout>
  )
}

export default VerifyEmail
