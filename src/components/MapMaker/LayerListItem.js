// @flow
import React from 'react'
import GroupTag from '../Groups/GroupTag'
import Formsy from 'formsy-react'
import Toggle from '../../components/forms/toggle'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {Layer} from '../../types/layer'
import _isEqual from 'lodash.isequal'
import flow from 'lodash.flow'
import MapStyles from '../../components/Map/Styles'
import {Tooltip} from 'react-tippy'
import ConfirmationActions from '../../actions/ConfirmationActions'

require('dnd-core/lib/actions/dragDrop')
import {DragSource, DropTarget} from 'react-dnd'
import DraggleIndicator from '../../components/UI/DraggableIndicator'
import DragItemConfig from '../../components/UI/DragItemConfig'

type Props = {
  id: number,
  item: Layer,
  moveItem: Function,
  showVisibility: boolean,
  showRemove: boolean,
  showDesign: boolean,
  showEdit: boolean,
  toggleVisibility: Function,
  removeFromMap: Function,
  showLayerDesigner: Function,
  editLayer: Function,
  isDragging: boolean,
  connectDragSource: Function,
  connectDropTarget: Function,
  index: number
}

class LayerListItem extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps = {
    showVisibility: false
  }

  shouldComponentUpdate (nextProps, nextState) {
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
    const {__} = this
    const {item, removeFromMap} = this.props
    ConfirmationActions.showConfirmation({
      title: __('Remove Layer'),
      postitiveButtonText: __('Remove'),
      negativeButtonText: __('Cancel'),
      message: __('Warning! This will remove also remove any custom style settings for this layer saved as part of this map.'),
      onPositiveResponse () {
        removeFromMap(item)
      }
    })
  }

  showLayerDesigner = () => {
    this.props.showLayerDesigner(this.props.item.layer_id)
  }

  toggleVisibility = () => {
    this.props.toggleVisibility(this.props.item.layer_id)
  }

  render () {
    const _this = this
    const layer: Layer = this.props.item
    const layer_id = layer.layer_id ? layer.layer_id : 0
    const canEdit = (this.props.showEdit &&
                    layer.canEdit &&
                    !layer.remote &&
                    !layer.is_external)

    const isDragging = this.props.isDragging
    const connectDragSource = this.props.connectDragSource
    const connectDropTarget = this.props.connectDropTarget
    let backgroundColor = 'white'
    const active = MapStyles.settings.get(layer.style, 'active')

    if (!active) {
      backgroundColor = '#eeeeee'
    }

    let buttonCount = 1
    if (this.props.showRemove) buttonCount++
    if (this.props.showDesign) buttonCount++
    if (canEdit) buttonCount++
    let buttonClass = ''
    if (buttonCount === 1) {
      buttonClass = 'col s12 no-padding'
    } else if (buttonCount === 2) {
      buttonClass = 'col s6 no-padding'
    } else if (buttonCount === 3) {
      buttonClass = 'col s4 no-padding'
    } else {
      buttonClass = 'col s3 no-padding'
    }

    let removeButton = ''
    let designButton = ''
    let editButton = ''
    let visibilityToggle = ''
    if (this.props.showRemove) {
      removeButton = (
        <div className={buttonClass} style={{height: '30px', width: '22px'}}>
          <Tooltip
            title={this.__('Remove from Map')}
            position='top' inertia followCursor>
            <a onClick={this.removeFromMap} className='layer-item-btn'>
              <i className='material-icons omh-accent-text'
                style={{height: 'inherit', lineHeight: 'inherit'}}>delete</i>
            </a>
          </Tooltip>
        </div>
      )
    }
    if (this.props.showDesign) {
      designButton = (
        <div className={buttonClass} style={{height: '30px', width: '22px'}}>
          <Tooltip
            title={this.__('Edit Layer Style')}
            position='top' inertia followCursor>
            <a onClick={this.showLayerDesigner}
              className='layer-item-btn'>
              <i className='material-icons omh-accent-text'
                style={{height: 'inherit', lineHeight: 'inherit'}}>color_lens</i>
            </a>
          </Tooltip>
        </div>
      )
    }
    if (canEdit) {
      editButton = (
        <div className={buttonClass} style={{height: '30px', width: '22px'}}>
          <Tooltip
            title={this.__('Edit Layer Data')}
            position='top' inertia followCursor>
            <a onClick={this.editLayer} className='layer-item-btn'>
              <i className='material-icons omh-accent-text'
                style={{height: 'inherit', lineHeight: 'inherit'}}>edit</i>
            </a>
          </Tooltip>
        </div>
      )
    }
    if (this.props.showVisibility) {
      visibilityToggle = (
        <div className='col s4 no-padding' style={{marginTop: '2px'}}>
          <Formsy>
            <Toggle name='visible' onChange={this.toggleVisibility}
              dataPosition='right' dataTooltip={this.__('Show/Hide Layer')}
              labelOff='' labelOn='' checked={active}
            />
          </Formsy>
        </div>
      )
    }

    return connectDragSource(connectDropTarget(
      <div className='collection-item'
        style={{
          opacity: isDragging ? 0.75 : 1,
          borderBottom: '1px solid #ddd',
          height: '70px',
          paddingRight: '10px',
          paddingLeft: '10px',
          paddingTop: '0px',
          paddingBottom: '0px',
          position: 'relative',
          backgroundColor}}>

        <div className='row no-margin'>
          <b className='title grey-text text-darken-4 truncate' style={{fontSize: '12px'}}>{this._o_(layer.name)}</b>
        </div>
        <div className='row no-margin'>
          <div className='title col no-padding s6'>
            <GroupTag group={layer.owned_by_group_id} />

          </div>

          <div className='col s6' style={{
            height: '30px',
            position: 'absolute',
            top: '18px',
            right: '20px',
            paddingTop: '0px',
            paddingBottom: '0px',
            paddingLeft: '0px',
            paddingRight: '0px'
          }}>
            <div className='col s8 no-padding'>
              <div className={buttonClass} style={{height: '30px', width: '22px'}}>
                <Tooltip
                  title={_this.__('Layer Info')}
                  position='right' inertia followCursor>
                  <a href={'/lyr/' + layer_id} target='_blank' rel='noopener noreferrer'
                    className='layer-item-btn'>
                    <i className='material-icons omh-accent-text'
                      style={{height: 'inherit', lineHeight: 'inherit'}}>info</i>
                  </a>
                </Tooltip>
              </div>
              {removeButton}
              {designButton}
              {editButton}
            </div>
            {visibilityToggle}
          </div>
        </div>
        <div className='row no-margin'>
          <p className='truncate no-margin no-padding grey-text text-darken-1' style={{fontSize: '8px', lineHeight: '10px'}}>{this._o_(layer.source)}</p>
        </div>
        <div className='draggable-indicator'
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
    ))
  }
}

export default flow(
  DropTarget('layer', DragItemConfig.dropTargetConfig, DragItemConfig.connect),
  DragSource('layer', DragItemConfig.dragSourceConfig, DragItemConfig.collect)
)(LayerListItem)
