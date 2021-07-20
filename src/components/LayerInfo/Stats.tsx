import React from 'react'
import { Row, Col } from 'antd'
import useT from '../../hooks/useT'
type Props = {
  stats: {
    maps: number
    stories: number
  }
}
export default function LayerInfoStats({ stats }: Props): JSX.Element {
  const { t } = useT()
  return (
    <Row
      justify='center'
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#FFF'
      }}
    >
      <Col
        sm={16}
        md={8}
        style={{
          textAlign: 'center'
        }}
      >
        <b>{t('Maps')}</b>
        <p>{stats && stats.maps}</p>
      </Col>
      <Col
        sm={16}
        md={8}
        style={{
          textAlign: 'center'
        }}
      >
        <b>{t('Stories')}</b>
        <p>{stats && stats.stories}</p>
      </Col>
    </Row>
  )
}
