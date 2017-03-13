var React = require('react');

var GroupTag = require('../Groups/GroupTag');
var Formsy = require('formsy-react');
var Toggle = require('../../components/forms/toggle');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var $ = require('jquery');
var _isEqual = require('lodash.isequal');
var flow = require('lodash.flow');
require('dnd-core/lib/actions/dragDrop');
var DragSource = require('react-dnd').DragSource;
var DropTarget = require('react-dnd').DropTarget;
var DraggleIndicator = require('../../components/UI/DraggableIndicator');
var DragItemConfig = require('../../components/UI/DragItemConfig');

var LayerListItem = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    id: React.PropTypes.number.isRequired,
    item: React.PropTypes.object.isRequired,    
    moveItem: React.PropTypes.func.isRequired,
    showVisibility: React.PropTypes.bool,
    showRemove: React.PropTypes.bool,
    showDesign: React.PropTypes.bool,
    showEdit: React.PropTypes.bool,
    toggleVisibility: React.PropTypes.func,
    removeFromMap: React.PropTypes.func,
    showLayerDesigner: React.PropTypes.func,
    editLayer: React.PropTypes.func,
    isDragging: React.PropTypes.bool.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    index: React.PropTypes.number.isRequired,
  },

  getDefaultProps(){
    return {
      showVisibility: false
    };
  },

  getInitialState(){
    return {
    };
  },

  componentDidMount(){
    $('.map-layer-tooltipped').tooltip();
  },

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isEqual(this.props, nextProps)){
      return true;
    }
    if(!_isEqual(this.state, nextState)){
      return true;
    }
    return false;
  },

  resetTooltips(){
    $('.map-layer-tooltipped').tooltip('remove');
    $('.map-layer-tooltipped').tooltip();
  },

  removeFromMap(layer){
    $('.map-layer-tooltipped').tooltip('remove');
    this.props.removeFromMap(layer);
  },

  render() {
    var _this = this;
    var layer = this.props.item;
    var canEdit = (this.props.showEdit 
                    && layer.canEdit 
                    && !layer.remote 
                    && !layer.is_external);

    var isDragging = this.props.isDragging;
    var connectDragSource = this.props.connectDragSource;
    var connectDropTarget = this.props.connectDropTarget;
    var backgroundColor = 'inherit';
            if(!layer.active){
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
        <div className={buttonClass} style={{height: '30px'}}>
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
        <div className={buttonClass} style={{height: '30px'}}>
          <a onClick={function(){_this.props.showLayerDesigner(layer); _this.resetTooltips();}}
            className="layer-item-btn map-layer-tooltipped"
            data-position="top" data-delay="50" data-tooltip={_this.__('Edit Layer Style')}>
            <i className="material-icons omh-accent-text" 
            style={{height: 'inherit', lineHeight: 'inherit'}}>color_lens</i></a>
        </div>  
      );
    }
    if(canEdit){
      editButton = (
        <div className={buttonClass} style={{height: '30px'}}>
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
        <div className="col s5 no-padding" style={{marginTop: '2px'}}>
          <Formsy.Form>
            <Toggle name="visible" onChange={function(){_this.props.toggleVisibility(layer.layer_id);}} 
            labelOff="" labelOn="" checked={layer.active}
            />
          </Formsy.Form>
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
          <b className="title grey-text text-darken-4 truncate" style={{fontSize: '12px'}}>{layer.name}</b>        
        </div>
        <div className="row no-margin">
          <div className="title col no-padding s6">
            <GroupTag group={layer.owned_by_group_id} />
          </div>
            
        </div>
        <div className="col s6" style={{
          height: '30px', position: 'absolute', top: '18px', right: '20px', 
          paddingTop: '0px', 
          paddingBottom: '0px', 
          paddingLeft: '0px', 
          paddingRight: '0px'
          }}>
          <div className="col s7 no-padding">
           <div className={buttonClass} style={{height: '30px'}}>
              <a href={'/lyr/'+ layer.layer_id} target="_blank"
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
          <div className="row no-margin">         
            <p className="truncate no-margin no-padding grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{layer.source}</p>
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

});

module.exports = flow(
  DropTarget('layer', DragItemConfig.dropTargetConfig, DragItemConfig.connect),
  DragSource('layer', DragItemConfig.dragSourceConfig, DragItemConfig.collect),
)(LayerListItem);
