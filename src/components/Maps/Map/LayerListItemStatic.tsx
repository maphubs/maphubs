import React, { useState } from 'react'
import { Switch, Row, Col, Tooltip } from 'antd'
import Info from '@material-ui/icons/Info'
import MapStyles from '../Map/Styles'
import useMapT from '../hooks/useMapT'
type Props = {
  item: Record<string, any>
  toggleVisibility: (...args: Array<any>) => void
}

const LayerListItemStatic = ({
  toggleVisibility,
  item
}: Props): JSX.Element => {
  const { t } = useMapT()
  const { name, source, layer_id, style } = item
  const active = MapStyles.settings.get(style, 'active')
  const [toggled, setToggled] = useState(active)
  return (
    <div
      style={{
        borderBottom: '1px solid #ddd',
        height: '65px',
        padding: '5px 5px',
        position: 'relative',
        backgroundColor: toggled ? 'white' : '#eeeeee'
      }}
    >
      <Row>
        <b
          className='truncate'
          style={{
            fontSize: '12px'
          }}
        >
          {t(name)}
        </b>
      </Row>
      <Row>
        <p
          className='truncate no-margin no-padding'
          style={{
            fontSize: '8px',
            lineHeight: '10px'
          }}
        >
          {t(source)}
        </p>
      </Row>
      <Row justify='end'>
        <Col span={4}>
          <Tooltip title={t('Layer Info')} placement='right'>
            <a
              href={'/lyr/' + layer_id}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Info
                style={{
                  fontSize: '20px'
                }}
              />
            </a>
          </Tooltip>
        </Col>
        <Col span={4}>
          <Tooltip title={t('Show/Hide Layer')} placement='right'>
            <Switch
              size='small'
              style={{
                marginBottom: '5px'
              }}
              checked={toggled}
              onChange={(val) => {
                setToggled(val)
                toggleVisibility(layer_id)
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    </div>
  )
}

export default LayerListItemStatic
