import React, { useState, useRef } from 'react'
import EditBaseMapBox from './ToolPanels/EditBaseMapBox'
import BaseMapSelection from './ToolPanels/BaseMapSelection'
import MeasurementToolPanel from './ToolPanels/MeasurementToolPanel'
import IsochronePanel from './ToolPanels/IsochronePanel'
import CoordinatePanel from './ToolPanels/CoordinatePanel'
// import AreaComparisonPanel from './ToolPanels/AreaComparisonPanel'
import MapToolButton from './MapToolButton'
import { Drawer, Collapse } from 'antd'
import { LocalizedString } from '../../types/LocalizedString'
const Panel = Collapse.Panel
type Props = {
  show?: boolean
  gpxLink?: string
  onChangeBaseMap: (...args: Array<any>) => any
  toggleMeasurementTools: (...args: Array<any>) => any
  enableMeasurementTools?: boolean
  getIsochronePoint: (...args: Array<any>) => any
  clearIsochroneLayers: (...args: Array<any>) => any
  measureFeatureClick: (...args: Array<any>) => any
  zoomToCoordinates: (...args: Array<any>) => any
  isochroneResult?: Record<string, any>
  t: (v: string | LocalizedString) => string
}
type State = {
  open?: boolean
}
const MapToolPanel = ({
  t,
  show,
  gpxLink,
  onChangeBaseMap,
  enableMeasurementTools,
  toggleMeasurementTools,
  measureFeatureClick,
  zoomToCoordinates,
  getIsochronePoint,
  clearIsochroneLayers,
  isochroneResult
}: Props): JSX.Element => {
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
                t={t}
              />
            </Panel>
            <Panel header={t('Measurement Tools')} key='measurement'>
              <MeasurementToolPanel
                enableMeasurementTools={enableMeasurementTools}
                toggleMeasurementTools={toggleMeasurementTools}
                measureFeatureClick={measureFeatureClick}
                closePanel={() => {
                  setOpen(false)
                }}
                t={t}
              />
            </Panel>
            <Panel header={t('Find Coordinates')} key='coordinate'>
              <CoordinatePanel zoomToCoordinates={zoomToCoordinates} t={t} />
            </Panel>
            <Panel header={t('Travel Time')} key='traveltime'>
              <IsochronePanel
                getIsochronePoint={getIsochronePoint}
                clearIsochroneLayers={clearIsochroneLayers}
                isochroneResult={isochroneResult}
                t={t}
              />
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
