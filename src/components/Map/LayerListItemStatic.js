// @flow
import React from 'react'
import { Switch, Row, Col, Icon } from 'antd'
import MapStyles from '../Map/Styles'
import {Tooltip} from 'react-tippy'

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
          paddingRight: '5px',
          paddingLeft: '5px',
          paddingTop: '2px',
          paddingBottom: '0px',
          position: 'relative',
          backgroundColor: active ? 'white' : '#eeeeee'
        }}>
        <Row>
          <b className='title grey-text text-darken-4 truncate' style={{fontSize: '14px'}}>{t(name)}</b>
        </Row>
        <Row>
          <p className='truncate no-margin no-padding grey-text text-darken-1' style={{fontSize: '8px', lineHeight: '10px'}}>{t(source)}</p>
        </Row>
        <Row type='flex' justify='end'>
          <Col span={4}>
            <Tooltip
              title={t('Layer Info')}
              position='right' inertia followCursor>
              <a href={'/lyr/' + layer_id} target='_blank' rel='noopener noreferrer'>
                <Icon style={{fontSize: '20px'}} type='info-circle' theme='twoTone' twoToneColor={MAPHUBS_CONFIG.primaryColor} />
              </a>
            </Tooltip>
          </Col>
          <Col span={4}>
            <Tooltip
              title={t('Show/Hide Layer')}
              position='right' inertia followCursor>
              <Switch size='small' style={{marginBottom: '5px'}} checked={active}
                onChange={() => { toggleVisibility(layer_id) }} />
            </Tooltip>
          </Col>
        </Row>
      </div>
    )
  }
}
