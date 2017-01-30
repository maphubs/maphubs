var React = require('react');
var ReactDom = require('react-dom');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var GroupTag = require('../../components/Groups/GroupTag');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var flow = require('lodash.flow');
require('dnd-core/lib/actions/dragDrop');
var DragSource = require('react-dnd').DragSource;
var DropTarget = require('react-dnd').DropTarget;

/**
 * Implements the drag source contract.
 */
var layerSource = {
  beginDrag(props) {
     return {
      id: props.layer.layer_id,
      layer: props.layer,
      index: props.index,
      targetIndex: null
    };
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      return;
    }

    const item = monitor.getItem();
    const dragIndex = item.index;
    const targetIndex = item.targetIndex;

    // Don't replace items with themselves
    if (targetIndex === undefined || dragIndex === targetIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveLayer(dragIndex, targetIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = targetIndex;
  }
};


/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

function connect(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

const layerTarget = {
  hover(props, monitor, component) {
    //update style of targer?
    const dragIndex = monitor.getItem().index;
    const targetIndex = props.index;
    monitor.getItem().targetIndex = targetIndex;
   
        // Determine rectangle on screen
    const hoverBoundingRect = ReactDom.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < targetIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > targetIndex && hoverClientY > hoverMiddleY) {
      return;
    }

     

  },
};

var HomePageMapLayerItem = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    layer: React.PropTypes.object.isRequired,    
    moveLayer: React.PropTypes.func.isRequired,
    toggleVisibility: React.PropTypes.func.isRequired,
    isDragging: React.PropTypes.bool.isRequired,
    connectDragSource: React.PropTypes.func.isRequired,
    connectDropTarget: React.PropTypes.func.isRequired,
    index: React.PropTypes.number.isRequired,
  },

  render() {
    var _this = this;
    var layer = this.props.layer;

    var isDragging = this.props.isDragging;
    var connectDragSource = this.props.connectDragSource;
    var connectDropTarget = this.props.connectDropTarget;
    var icon = 'visibility', backgroundColor = 'inherit';
            if(!layer.active){
               icon = 'visibility_off';
               backgroundColor = '#eeeeee';
            }

    return connectDragSource(connectDropTarget(
      <div className="collection-item"
        style={{
          opacity: isDragging ? 0.75 : 1, 
          borderBottom: '1px solid #ddd',
          height: '70px', 
          paddingRight: '10px', paddingLeft: '10px', 
          paddingTop: '0px', paddingBottom: '0px',
          backgroundColor}}>
          <div className="row no-margin">
            <b className="title grey-text text-darken-4" style={{fontSize: '12px'}}>{layer.name}</b>        
          </div>
          <div className="row no-margin">
            <div className="title col no-padding s6">
              <GroupTag group={layer.owned_by_group_id} />
               <p className="truncate no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{layer.source}</p>
             </div>
            <div className="secondary-content col s6 no-padding" style={{height: '30px'}}>

              <div className="col s3 no-padding">
                <a href={'/lyr/'+ layer.layer_id} target="_blank"
                  className="create-map-btn"
                  style={{height: '30px', lineHeight: '30px'}}
                  data-position="top" data-delay="50" data-tooltip={_this.__('Layer Info')}>
                  <i className="material-icons omh-accent-text">info</i>
                  </a>
              </div>
              <div className="col s3 no-padding">
                <a onClick={function(){_this.props.toggleVisibility(layer.layer_id);}}
                  className="create-map-btn"
                  style={{height: '30px', lineHeight: '30px'}}
                  data-position="top" data-delay="50" data-tooltip={_this.__('Toggle Visibility')}>
                  <i className="material-icons omh-accent-text">{icon}</i>
                </a>
              </div>
          </div>
        </div>
      </div>
    ));
  }

});

module.exports = flow(
  DropTarget('layer', layerTarget, connect),
  DragSource('layer', layerSource, collect),
)(HomePageMapLayerItem);