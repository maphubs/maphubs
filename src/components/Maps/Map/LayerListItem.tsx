import React from 'react'
import type { Layer } from '../../../types/layer'
import _isEqual from 'lodash.isequal'
import flow from 'lodash.flow'
import MapStyles from './Styles'
import { Popconfirm, Switch, Row, Col, Tooltip } from 'antd'
import Delete from '@material-ui/icons/Delete'
import Palette from '@material-ui/icons/Palette'
import Info from '@material-ui/icons/Info'
import Edit from '@material-ui/icons/Edit'
import { DragSource, DropTarget } from 'react-dnd'
import DraggleIndicator from './UI/DraggableIndicator'
import DragItemConfig from './UI/DragItemConfig'

import 'dnd-core/lib/actions/dragDrop'
import { LocalizedString } from '../../../types/LocalizedString'

type Props = {
  item: Layer
  showVisibility?: boolean
  showRemove: boolean
  showDesign: boolean
  showEdit: boolean
  showInfo: boolean
  toggleVisibility: (...args: Array<any>) => any
  removeFromMap: (...args: Array<any>) => any
  showLayerDesigner: (...args: Array<any>) => any
  editLayer: (...args: Array<any>) => any
  isDragging: boolean
  connectDragSource: (...args: Array<any>) => any
  connectDropTarget: (...args: Array<any>) => any
  t: (v: string | LocalizedString) => string
}

class LayerListItem extends React.Component<Props> {
  shouldComponentUpdate(nextProps, nextState) {
    // only update if something changes
    if (!_isEqual(this.props, nextProps)) {
      return true
    }

    if (!_isEqual(this.state, nextState)) {
      return true
    }

    return false
  }

  editLayer = () => {
    this.props.editLayer(this.props.item)
  }
  removeFromMap = () => {
    this.props.removeFromMap(this.props.item)
  }
  showLayerDesigner = () => {
    this.props.showLayerDesigner(this.props.item.layer_id)
  }
  toggleVisibility = () => {
    this.props.toggleVisibility(this.props.item.layer_id)
  }

  render() {
    const {
      t,
      isDragging,
      connectDragSource,
      connectDropTarget,
      showVisibility,
      showRemove,
      showDesign,
      showInfo,
      item,
      showEdit
    } = this.props
    const layer: Layer = item
    const layer_id = layer.layer_id ? layer.layer_id : 0
    const canEdit =
      showEdit && layer.canEdit && !layer.remote && !layer.is_external
    const active = MapStyles.settings.get(layer.style, 'active')
    return connectDragSource(
      connectDropTarget(
        <div
          style={{
            opacity: isDragging ? 0.75 : 1,
            borderBottom: '1px solid #ddd',
            height: '65px',
            width: '100%',
            padding: '5px 10px 5px 5px',
            position: 'relative',
            backgroundColor: active ? 'white' : '#eeeeee'
          }}
        >
          <Row>
            <b
              className='truncate'
              style={{
                fontSize: '12px'
              }}
            >
              {t(layer.name)}
            </b>
          </Row>
          <Row>
            <p
              className='truncate no-margin'
              style={{
                fontSize: '8px',
                lineHeight: '10px',
                padding: '0px 0px 2px 0px'
              }}
            >
              {t(layer.source)}
            </p>
          </Row>
          <Row
            style={{
              textAlign: 'center'
            }}
            justify='end'
          >
            {showInfo && (
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
            )}
            {showRemove && (
              <Col span={4}>
                <Tooltip title={t('Remove from Map')} placement='top'>
                  <Popconfirm
                    title={t('Remove Layer') + ' ' + t(layer.name)}
                    onConfirm={this.removeFromMap}
                    onCancel={() => {}}
                    okText={t('Remove')}
                    cancelText={t('Cancel')}
                  >
                    <a href='#'>
                      <Delete
                        style={{
                          fontSize: '20px'
                        }}
                      />
                    </a>
                  </Popconfirm>
                </Tooltip>
              </Col>
            )}
            {showDesign && (
              <Col span={4}>
                <Tooltip title={t('Edit Layer Style')} placement='top'>
                  <a onClick={this.showLayerDesigner}>
                    <Palette
                      style={{
                        fontSize: '20px'
                      }}
                    />
                  </a>
                </Tooltip>
              </Col>
            )}
            {canEdit && (
              <Col span={4}>
                <Tooltip title={t('Edit Layer Data')} placement='top'>
                  <a onClick={this.editLayer}>
                    <Edit
                      style={{
                        fontSize: '20px'
                      }}
                    />
                  </a>
                </Tooltip>
              </Col>
            )}
            {showVisibility && (
              <Col span={4}>
                <Tooltip title={t('Show/Hide Layer')} placement='right'>
                  <Switch
                    size='small'
                    style={{
                      marginBottom: '5px'
                    }}
                    checked={active}
                    onChange={this.toggleVisibility}
                  />
                </Tooltip>
              </Col>
            )}
          </Row>
          <div
            className='draggable-indicator'
            style={{
              width: '8px',
              height: '50px',
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              margin: 'auto'
            }}
          >
            <DraggleIndicator numX={2} numY={16} width={12} height={64} />
          </div>
        </div>
      )
    )
  }
}

export default flow(
  DropTarget('layer', DragItemConfig.dropTargetConfig, DragItemConfig.connect),
  DragSource('layer', DragItemConfig.dragSourceConfig, DragItemConfig.collect)
)(LayerListItem) as any
