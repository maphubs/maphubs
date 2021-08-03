import React, { useEffect, useState } from 'react'
import { signIn } from 'next-auth/client'
import { Layout, Row, Form, Input, Button, Card } from 'antd'
import { MailOutlined } from '@ant-design/icons'

const Login = (): JSX.Element => {
  let redirectUrl = '/'
  const [pending, setPending] = useState(false)
  useEffect(() => {
    const url = new URL(location.href)
    redirectUrl = url.searchParams.get('callbackUrl')
  })
  return (
    <Layout
      title='Login - Palmoil.io'
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
            title='Login'
            style={{
              width: '350px'
            }}
          >
            <Form
              name='login'
              onFinish={(values) => {
                setPending(true)
                signIn('email', {
                  email: values.email,
                  callbackUrl: redirectUrl
                })
              }}
              onFinishFailed={(errorInfo: any) => {
                console.log('Failed:', errorInfo)
              }}
              validateMessages={{
                required: '${label} is required!',
                types: {
                  email: 'Please entered a valid email'
                }
              }}
              initialValues={{
                remember: true
              }}
              style={{
                width: '300px'
              }}
              layout='vertical'
              size='large'
            >
              <Form.Item
                label='Email'
                name='email'
                rules={[
                  {
                    required: true
                  },
                  {
                    type: 'email'
                  }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder='Enter your email'
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type='primary'
                  htmlType='submit'
                  style={{
                    width: '100%'
                  }}
                  loading={pending}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Row>
      </div>
    </Layout>
  )
}

export default Login
