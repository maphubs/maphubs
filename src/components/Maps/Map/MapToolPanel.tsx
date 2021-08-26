import React, { useState, useRef } from 'react'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
import CoordinatePanel from './ToolPanels/CoordinatePanel'
// import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import MapToolButton from './MapToolButton'
import { Drawer, Collapse } from 'antd'
import useMapT from '../hooks/useMapT'

const Panel = Collapse.Panel
type Props = {
  show?: boolean
  gpxLink?: string
  onChangeBaseMap: (...args: Array<any>) => any
}
type State = {
  open?: boolean
}
const MapToolPanel = ({
  show,
  gpxLink,
  onChangeBaseMap
}: Props): JSX.Element => {
  const { t } = useMapT()
  const [open, setOpen] = useState(false)
  const drawerContainer = useRef(null)

  return (
    <>
      <MapToolButton
        tooltipText={t('Tools')}
        top='10px'
        right='10px'
        show={show}
        icon='build'
        onClick={() => setOpen(true)}
      />
      <div ref={drawerContainer} />
      <Drawer
        getContainer={() => drawerContainer.current}
        title={t('Tools')}
        visible={open}
        onClose={() => {
          setOpen(false)
        }}
        placement='right'
        bodyStyle={{
          padding: 0
        }}
        width='320px'
      >
        <div
          style={{
            height: '100%',
            border: 'solid 1px #ddd'
          }}
        >
          <Collapse accordion>
            <Panel header={t('Change Base Map')} key='basemap'>
              <BaseMapSelection
                onChange={(val: string) => {
                  setOpen(false)
                  onChangeBaseMap(val)
                }}
              />
            </Panel>
            <Panel header={t('Measurement Tools')} key='measurement'>
              <MeasurementToolPanel
                closePanel={() => {
                  setOpen(false)
                }}
              />
            </Panel>
            <Panel header={t('Find Coordinates')} key='coordinate'>
              <CoordinatePanel />
            </Panel>
            <Panel header={t('Travel Time')} key='traveltime'>
              <IsochronePanel />
            </Panel>
            <Panel header={t('Edit OpenStreetMap')} key='osm'>
              <EditBaseMapBox gpxLink={gpxLink} t={t} />
            </Panel>
          </Collapse>
        </div>
      </Drawer>
    </>
  )
}
export default MapToolPanel
