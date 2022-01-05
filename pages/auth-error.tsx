import React from 'react'
import Link from 'next/link'
import { Layout, Row, Button, Typography } from 'antd'
const { Title, Paragraph } = Typography

const AuthError = (): JSX.Element => {
  return (
    <Layout
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
          <Title level={1}>Unable to sign in</Title>
        </Row>
        <Row
          align='middle'
          justify='center'
          style={{
            width: '100%'
          }}
        >
          <Paragraph
            style={{
              fontSize: '1.2rem'
            }}
          >
            The sign in link is no longer valid.
          </Paragraph>
        </Row>
        <Row
          align='middle'
          justify='center'
          style={{
            width: '100%'
          }}
        >
          <Paragraph
            style={{
              fontSize: '1.2rem'
            }}
          >
            It may have been used already or it may have expired.
          </Paragraph>
        </Row>
        <Row
          align='middle'
          justify='center'
          style={{
            width: '100%'
          }}
        >
          <Link href='/'>
            <Button type='primary' size='large'>
              Request a New Link
            </Button>
          </Link>
        </Row>
      </div>
    </Layout>
  )
}

export default AuthError
