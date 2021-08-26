import React from 'react'
import LayerListItem from './LayerListItem'
import { List, Empty } from 'antd'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import update from 'react-addons-update'
import useMapT from '../hooks/useMapT'

type Props = {
  layers: Array<Record<string, any>>
  showVisibility?: boolean
  showInfo?: boolean
  showDesign?: boolean
  showRemove?: boolean
  showEdit?: boolean
  toggleVisibility?: (...args: Array<any>) => void
  removeFromMap?: (...args: Array<any>) => void
  showLayerDesigner?: (...args: Array<any>) => void
  updateLayers: (...args: Array<any>) => void
  editLayer?: (...args: Array<any>) => void
  openAddLayer?: (...args: Array<any>) => void
}

const LayerList = ({
  layers,
  updateLayers,
  toggleVisibility,
  showVisibility,
  showRemove,
  showDesign,
  showEdit,
  showInfo,
  removeFromMap,
  showLayerDesigner,
  editLayer,
  openAddLayer
}: Props): JSX.Element => {
  const { t } = useMapT()

  const moveLayer = (dragIndex: any, hoverIndex: any) => {
    const dragLayer = layers[dragIndex]
    const updatedLayers = update(layers, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragLayer]
      ]
    })
    updateLayers(updatedLayers)
  }

  const empty = !layers || layers.length === 0
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        padding: 0,
        margin: 0,
        border: '1px solid #eeeeee',
        overflowY: 'auto'
      }}
    >
      <style jsx global>
        {`
          .ant-list-item-content {
            width: 100%;
            overflow: hidden;
          }
        `}
      </style>
      {!empty && typeof window !== 'undefined' && (
        <DndProvider backend={HTML5Backend}>
          <List
            dataSource={layers}
            renderItem={(item, i) => (
              <List.Item
                key={item.layer_id}
                style={{
                  padding: 0
                }}
              >
                <LayerListItem
                  id={item.layer_id}
                  item={item}
                  index={i}
                  toggleVisibility={toggleVisibility}
                  showVisibility={showVisibility}
                  showRemove={showRemove}
                  showDesign={showDesign}
                  showEdit={showEdit}
                  showInfo={showInfo}
                  moveItem={moveLayer}
                  removeFromMap={removeFromMap}
                  showLayerDesigner={showLayerDesigner}
                  editLayer={editLayer}
                />
              </List.Item>
            )}
          />
        </DndProvider>
      )}
      {empty && (
        <div
          style={{
            height: '100%',
            paddingTop: '50%',
            margin: 0
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <a onClick={openAddLayer}>{t('Add a Layer')}</a>
              </span>
            }
          />
        </div>
      )}
    </div>
  )
}
export default LayerList
