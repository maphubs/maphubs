// @flow
import React from 'react'
import { Switch, Row, Col, Tooltip } from 'antd'
import Info from '@material-ui/icons/Info'
import MapStyles from '../Map/Styles'

type Props = {|
  item: Object,
  toggleVisibility: Function,
  t: Function
|}

export default class LayerListItemStatic extends React.Component<Props, void> {
  render () {
    const {t, toggleVisibility, item} = this.props
    const {name, source, layer_id, style} = item
    const active = MapStyles.settings.get(style, 'active')

    return (
      <div
        style={{
          borderBottom: '1px solid #ddd',
          height: '65px',
          padding: '5px 5px',
          position: 'relative',
          backgroundColor: active ? 'white' : '#eeeeee'
        }}>
        <Row>
          <b className='title grey-text text-darken-4 truncate' style={{fontSize: '12px'}}>{t(name)}</b>
        </Row>
        <Row>
          <p className='truncate no-margin no-padding grey-text text-darken-1' style={{fontSize: '8px', lineHeight: '10px'}}>{t(source)}</p>
        </Row>
        <Row type='flex' justify='end'>
          <Col span={4}>
            <Tooltip
              title={t('Layer Info')}
              placement='right' >
              <a href={'/lyr/' + layer_id} target='_blank' rel='noopener noreferrer'>
                <Info style={{fontSize: '20px'}} />
              </a>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip
              title={t('Show/Hide Layer')}
              placement='right' >
              <Switch size='small' style={{marginBottom: '5px'}} checked={active}
                onChange={() => { toggleVisibility(layer_id) }} />
            </Tooltip>
          </Col>
        </Row>
      </div>
    )
  }
}
