import React from 'react'
import { Row, Button } from 'antd'
import useT from '../../hooks/useT'
import { LocalizedString } from '../../types/LocalizedString'

const HomePageButton = ({
  label,
  href,
  style
}: {
  label: LocalizedString
  href: string
  style?: React.CSSProperties
}): JSX.Element => {
  const { t } = useT()
  style = style || {}

  return (
    <Row
      align='middle'
      justify='center'
      style={{
        padding: '25px',
        textAlign: 'center',
        ...style
      }}
    >
      <Button
        type='primary'
        size='large'
        style={{
          margin: 'auto'
        }}
        href={href}
      >
        {t(label)}
      </Button>
    </Row>
  )
}
export default HomePageButton
