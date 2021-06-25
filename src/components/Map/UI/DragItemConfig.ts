import ReactDom from 'react-dom'
export default {
  dragSourceConfig: {
    beginDrag(props) {
      return {
        id: props.id,
        item: props.item,
        index: props.index,
        targetIndex: undefined
      }
    },

    endDrag(props, monitor, component) {
      if (!monitor.didDrop()) {
        return
      }

      const item = monitor.getItem()
      const dragIndex = item.index
      const targetIndex = item.targetIndex

      // Don't replace items with themselves
      if (targetIndex === undefined || dragIndex === targetIndex) {
        return
      }

      // Time to actually perform the action
      props.moveItem(dragIndex, targetIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      monitor.getItem().index = targetIndex
    }
  },

  /**
   * Specifies the props to inject into your component.
   */
  collect(connect, monitor) {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging()
    }
  },

  connect(connect) {
    return {
      connectDropTarget: connect.dropTarget()
    }
  },

  dropTargetConfig: {
    hover(props, monitor, component) {
      // update style of targer?
      const dragIndex = monitor.getItem().index
      const targetIndex = props.index
      monitor.getItem().targetIndex = targetIndex
      // Determine rectangle on screen

      /* eslint-disable react/no-find-dom-node */
      const hoverBoundingRect = ReactDom.findDOMNode(
        component
      ).getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < targetIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > targetIndex && hoverClientY > hoverMiddleY) {
      }
    }
  }
}