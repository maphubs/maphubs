//@flow
import React from 'react';
import GroupTag from '../Groups/GroupTag';
import Formsy from 'formsy-react';
import Toggle from '../../components/forms/toggle';
var $ = require('jquery');
import _isEqual from 'lodash.isequal';
import flow from 'lodash.flow';
require('dnd-core/lib/actions/dragDrop');
import {DragSource, DropTarget} from 'react-dnd';
import MapStyles from '../../components/Map/Styles';
import DraggleIndicator from '../../components/UI/DraggableIndicator';
import DragItemConfig from '../../components/UI/DragItemConfig';

import MapHubsComponent from '../../components/MapHubsComponent';

import type {Layer} from '../../stores/layer-store';

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

  componentDidMount(){
    $('.map-layer-tooltipped').tooltip();
  }

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isEqual(this.props, nextProps)){
      return true;
    }
    if(!_isEqual(this.state, nextState)){
      return true;
    }
    return false;
  }

  resetTooltips = () => {
    $('.map-layer-tooltipped').tooltip('remove');
    $('.map-layer-tooltipped').tooltip();
  }

  removeFromMap = (layer) => {
    $('.map-layer-tooltipped').tooltip('remove');
    this.props.removeFromMap(layer);
  }

  render() {
    var _this = this;
    let layer: Layer = this.props.item;
    let layer_id = layer.layer_id ? layer.layer_id : 0;
    var canEdit = (this.props.showEdit 
                    && layer.canEdit 
                    && !layer.remote 
                    && !layer.is_external);

    var isDragging = this.props.isDragging;
    var connectDragSource = this.props.connectDragSource;
    var connectDropTarget = this.props.connectDropTarget;
    var backgroundColor = 'white';
    let active = MapStyles.settings.get(layer.style, 'active');

    if(!active){
        backgroundColor = '#eeeeee';
    }

    var buttonCount = 1;
    if(this.props.showRemove) buttonCount++;
    if(this.props.showDesign) buttonCount++;
    if(canEdit) buttonCount++;
    var buttonClass = '';
    if(buttonCount === 1){
      buttonClass = 'col s12 no-padding';
    }else if(buttonCount === 2){
      buttonClass = 'col s6 no-padding';
    }else if(buttonCount === 3){
      buttonClass = 'col s4 no-padding';
    }else{
       buttonClass = 'col s3 no-padding';
    }


    var removeButton = '', designButton = '', editButton = '', visibilityToggle = '';
    if(this.props.showRemove){
      removeButton = (
        <div className={buttonClass} style={{height: '30px', width: '22px'}}>
          <a onClick={function(){_this.removeFromMap(layer);}}
            className="layer-item-btn map-layer-tooltipped"
            data-position="top" data-delay="50" data-tooltip={_this.__('Remove from Map')}>
            <i className="material-icons omh-accent-text" 
            style={{height: 'inherit', lineHeight: 'inherit'}}>delete</i></a>
        </div>
      );
    }
    if(this.props.showDesign){
      designButton = (
        <div className={buttonClass} style={{height: '30px', width: '22px'}}>
          <a onClick={function(){_this.props.showLayerDesigner(layer.layer_id); _this.resetTooltips();}}
            className="layer-item-btn map-layer-tooltipped"
            data-position="top" data-delay="50" data-tooltip={_this.__('Edit Layer Style')}>
            <i className="material-icons omh-accent-text" 
            style={{height: 'inherit', lineHeight: 'inherit'}}>color_lens</i></a>
        </div>  
      );
    }
    if(canEdit){
      editButton = (
        <div className={buttonClass} style={{height: '30px', width: '22px'}}>
          <a onClick={function(){_this.props.editLayer(layer); _this.resetTooltips();}}
            className="layer-item-btn map-layer-tooltipped"
            data-position="top" data-delay="50" data-tooltip={_this.__('Edit Layer Data')}>
            <i className="material-icons omh-accent-text" 
            style={{height: 'inherit', lineHeight: 'inherit'}}>edit</i></a>
        </div>  
      );
    }
    if(this.props.showVisibility){
      visibilityToggle = (
        <div className="col s4 no-padding" style={{marginTop: '2px'}}>
          <Formsy>
            <Toggle name="visible" onChange={function(){_this.props.toggleVisibility(layer.layer_id);}} 
            labelOff="" labelOn="" checked={active}
            />
          </Formsy>
        </div>
      );
    }

    return connectDragSource(connectDropTarget(
      <div className="collection-item"
        style={{
          opacity: isDragging ? 0.75 : 1, 
          borderBottom: '1px solid #ddd',
          height: '70px', 
          paddingRight: '10px', paddingLeft: '10px', 
          paddingTop: '0px', paddingBottom: '0px',
          position: 'relative',
          backgroundColor}}>
          
        <div className="row no-margin">
          <b className="title grey-text text-darken-4 truncate" style={{fontSize: '12px'}}>{this._o_(layer.name)}</b>        
        </div>
        <div className="row no-margin">
          <div className="title col no-padding s6">
            <GroupTag group={layer.owned_by_group_id} />

          </div>
            
        <div className="col s6" style={{
          height: '30px', position: 'absolute', top: '18px', right: '20px', 
          paddingTop: '0px', 
          paddingBottom: '0px', 
          paddingLeft: '0px', 
          paddingRight: '0px'
          }}>
          <div className="col s8 no-padding">
           <div className={buttonClass} style={{height: '30px', width: '22px'}}>
              <a href={'/lyr/'+ layer_id} target="_blank" rel="noopener noreferrer"
                className="layer-item-btn map-layer-tooltipped"
                data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
                <i className="material-icons omh-accent-text" 
                style={{height: 'inherit', lineHeight: 'inherit'}}>info</i>
                </a>
            </div>
            {removeButton}
            {designButton}
            {editButton}
            </div>
            {visibilityToggle}
          </div>
           </div>
          <div className="row no-margin">         
            <p className="truncate no-margin no-padding grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{this._o_(layer.source)}</p>
          </div>
        <div className="draggable-indicator"
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
    ));
  }

}

export default flow(
  DropTarget('layer', DragItemConfig.dropTargetConfig, DragItemConfig.connect),
  DragSource('layer', DragItemConfig.dragSourceConfig, DragItemConfig.collect),
)(LayerListItem);
